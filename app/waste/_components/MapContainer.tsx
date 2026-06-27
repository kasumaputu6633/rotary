"use client";

import Map, { Layer, Marker, Source } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Supercluster from "supercluster";
import type { BBox, FeatureCollection, Point } from "geojson";
import type { LayerProps, MapRef, ViewStateChangeEvent } from "react-map-gl/mapbox";
import MapControls from "./MapControls";
import MapPin from "./MapPin";
import type { WasteLocation } from "../actions";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

interface MapContainerProps {
  locations: WasteLocation[];
  onMarkerClick: (locationId: string) => void;
  activeLocationId: string | null;
  recenterRequestKey?: number;
}

type LocationGeoJsonProperties = {
  id: string;
  name: string;
  type: string;
  isSelected: "true" | "false";
};

export default function MapContainer({
  locations,
  onMarkerClick,
  activeLocationId,
  recenterRequestKey = 0,
}: MapContainerProps) {
  const mapRef = useRef<MapRef>(null);

  const [viewState, setViewState] = useState({
    longitude: 115.1889,
    latitude: -8.4095,
    zoom: 10,
  });
  const [bounds, setBounds] = useState<BBox | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  const updateBounds = () => {
    const map = mapRef.current?.getMap();
    const currentBounds = map?.getBounds();

    if (currentBounds) {
      setBounds([
        currentBounds.getWest(),
        currentBounds.getSouth(),
        currentBounds.getEast(),
        currentBounds.getNorth(),
      ]);
    }
  };

  const focusActiveLocation = useCallback(() => {
    if (!activeLocationId || !mapRef.current) return;

    const location = locations.find((item) => item.id === activeLocationId);
    if (typeof location?.latitude !== "number" || typeof location.longitude !== "number") return;

    const currentZoom = mapRef.current.getZoom();
    const targetZoom = Math.max(currentZoom, 15);

    mapRef.current.flyTo({
      center: [location.longitude, location.latitude],
      zoom: targetZoom,
      duration: 900,
      essential: true,
    });
  }, [activeLocationId, locations]);

  useEffect(() => {
    focusActiveLocation();
  }, [focusActiveLocation, recenterRequestKey]);

  const supercluster = useMemo(() => {
    const cluster = new Supercluster({
      radius: 64,
      maxZoom: 14,
    });

    const points = locations
      .filter(
        (location) =>
          typeof location.latitude === "number" && typeof location.longitude === "number",
      )
      .map((location) => ({
        type: "Feature" as const,
        properties: {
          cluster: false,
          locationId: location.id,
          type: location.type,
          namaUsaha: location.namaUsaha,
        },
        geometry: {
          type: "Point" as const,
          coordinates: [location.longitude as number, location.latitude as number],
        },
      }));

    cluster.load(points);
    return cluster;
  }, [locations]);

  const clusters = useMemo(() => {
    if (!bounds) return [];
    return supercluster.getClusters(bounds, Math.floor(viewState.zoom));
  }, [bounds, supercluster, viewState.zoom]);

  const geojsonData = useMemo<FeatureCollection<Point, LocationGeoJsonProperties>>(() => {
    const features = clusters
      .filter((feature) => !feature.properties.cluster)
      .map((feature) => {
        const props = feature.properties;
        const isSelected = activeLocationId === props.locationId;
        const showLabel =
          isSelected ||
          viewState.zoom >= 13 ||
          (viewState.zoom >= 11 && props.type === "tps");

        return {
          type: "Feature" as const,
          geometry: feature.geometry as Point,
          properties: {
            id: props.locationId,
            name: showLabel ? props.namaUsaha : "",
            type: props.type,
            isSelected: isSelected ? ("true" as const) : ("false" as const),
          },
        };
      });

    return {
      type: "FeatureCollection" as const,
      features,
    };
  }, [activeLocationId, clusters, viewState.zoom]);

  const labelLayerStyle: LayerProps = {
    id: "location-labels",
    type: "symbol",
    source: "locations-source",
    layout: {
      "text-field": ["get", "name"],
      "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
      "text-size": ["match", ["get", "isSelected"], "true", 15, 12],
      "text-variable-anchor": ["left", "right", "top", "bottom"],
      "text-radial-offset": 1.45,
      "text-justify": "auto",
      "text-allow-overlap": false,
    },
    paint: {
      "text-color": [
        "match",
        ["get", "isSelected"],
        "true",
        "#17458f",
        ["match", ["get", "type"], "tps", "#17458f", "#247839"],
      ],
      "text-halo-color": "#ffffff",
      "text-halo-width": 2,
    },
  };

  const handleClusterClick = (clusterId: number, longitude: number, latitude: number) => {
    const expansionZoom = Math.min(supercluster.getClusterExpansionZoom(clusterId), 18);

    mapRef.current?.flyTo({
      center: [longitude, latitude],
      zoom: expansionZoom,
      duration: 700,
    });
  };

  const zoomBy = (delta: number) => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    map.easeTo({
      zoom: map.getZoom() + delta,
      duration: 250,
    });
  };

  const handleLocate = () => {
    if (!navigator.geolocation) {
      setLocationError("Browser belum mendukung lokasi.");
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        setUserLocation(nextLocation);
        setIsLocating(false);
        mapRef.current?.flyTo({
          center: [nextLocation.longitude, nextLocation.latitude],
          zoom: 14,
          duration: 800,
          essential: true,
        });
      },
      () => {
        setIsLocating(false);
        setLocationError("Lokasi tidak bisa diakses.");
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#dce8ee]">
      <Map
        ref={mapRef}
        {...viewState}
        onLoad={updateBounds}
        onMove={(event: ViewStateChangeEvent) => {
          setViewState(event.viewState);
          updateBounds();
        }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: "100%", height: "100%" }}
      >
        {clusters.map((cluster) => {
          const [longitude, latitude] = cluster.geometry.coordinates;
          const {
            cluster: isCluster,
            point_count: pointCount,
            cluster_id: clusterId,
          } = cluster.properties;

          if (isCluster) {
            const size = Math.min(60, Math.max(36, 30 + pointCount * 1.5));

            return (
              <Marker key={`cluster-${clusterId}`} longitude={longitude} latitude={latitude} anchor="center">
                <button
                  type="button"
                  className="flex items-center justify-center rounded-full border-2 border-white bg-[#17458f] font-poppins font-bold text-white shadow-[0_8px_12px_rgba(23,69,143,0.24)] transition hover:-translate-y-0.5 hover:bg-[#123a79] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f7a81b] focus-visible:ring-offset-2"
                  style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    fontSize: `${pointCount > 99 ? "12px" : "15px"}`,
                  }}
                  onClick={(event) => {
                    event.stopPropagation();
                    handleClusterClick(clusterId, longitude, latitude);
                  }}
                  aria-label={`${pointCount} lokasi penampung`}
                >
                  {pointCount}
                </button>
              </Marker>
            );
          }

          const locationId = cluster.properties.locationId;
          const isSelected = activeLocationId === locationId;

          return (
            <Marker
              key={`marker-${locationId}`}
              longitude={longitude}
              latitude={latitude}
              anchor="bottom"
              style={{ zIndex: isSelected ? 50 : 1 }}
            >
              <MapPin
                type={cluster.properties.type}
                isSelected={isSelected}
                onClick={(event) => {
                  event.stopPropagation();
                  onMarkerClick(locationId);
                }}
              />
            </Marker>
          );
        })}

        {userLocation && (
          <Marker longitude={userLocation.longitude} latitude={userLocation.latitude} anchor="center">
            <div className="h-5 w-5 rounded-full border-[4px] border-white bg-[#17458f] shadow-[0_0_0_8px_rgba(23,69,143,0.18)]" />
          </Marker>
        )}

        <Source id="locations-source" type="geojson" data={geojsonData}>
          <Layer {...labelLayerStyle} />
        </Source>
      </Map>

      <MapControls
        isLocating={isLocating}
        onLocate={handleLocate}
        onZoomIn={() => zoomBy(1)}
        onZoomOut={() => zoomBy(-1)}
      />

      {locationError && (
        <div className="absolute right-4 top-[148px] z-10 rounded-lg border border-amber-200 bg-white px-4 py-3 font-poppins text-xs font-semibold text-amber-700">
          {locationError}
        </div>
      )}
    </div>
  );
}
