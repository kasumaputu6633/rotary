"use client";

import Map, { Marker, MapRef, Source, Layer } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { useState, useRef, useEffect, useMemo } from "react";
import Supercluster from "supercluster";
import { BBox } from "geojson";
import MapPin from "./MapPin";
import type { WasteLocation } from "../actions";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

interface MapContainerProps {
  locations: WasteLocation[];
  onMarkerClick: (locationId: string) => void;
  activeLocationId: string | null;
}

export default function MapContainer({ locations, onMarkerClick, activeLocationId }: MapContainerProps) {
  const mapRef = useRef<MapRef>(null);

  const [viewState, setViewState] = useState({
    longitude: 115.1889, // Bali longitude
    latitude: -8.4095, // Bali latitude
    zoom: 10
  });

  const [bounds, setBounds] = useState<BBox | null>(null);

  const updateBounds = () => {
    if (mapRef.current) {
      const b = mapRef.current.getMap().getBounds();
      if (b) {
        setBounds([b.getWest(), b.getSouth(), b.getEast(), b.getNorth()]);
      }
    }
  };

  // Efek untuk memfokuskan (terbang) peta ke lokasi yang dipilih
  useEffect(() => {
    if (activeLocationId && mapRef.current) {
      const location = locations.find(loc => loc.id === activeLocationId);
      if (location && location.latitude && location.longitude) {
        const currentZoom = mapRef.current.getZoom();
        const targetZoom = Math.max(currentZoom, 15); // Pastikan selalu di atas maxZoom supercluster (14)
        
        mapRef.current.flyTo({
          center: [location.longitude, location.latitude],
          zoom: targetZoom, 
          duration: 1200, 
          essential: true
        });
      }
    }
  }, [activeLocationId, locations]);

  // Inisialisasi Supercluster
  const supercluster = useMemo(() => {
    const sc = new Supercluster({
      radius: 60, // Radius seberapa dekat titik akan digabung (dalam pixel)
      maxZoom: 14 // Di atas zoom 14, titik-titik tidak akan digabung lagi (tersebar)
    });
    
    const validLocations = locations.filter(loc => loc.latitude && loc.longitude);
    
    const points = validLocations.map(loc => ({
      type: "Feature" as const,
      properties: { 
        cluster: false, 
        locationId: loc.id, 
        type: loc.type,
        namaUsaha: loc.namaUsaha,
      },
      geometry: {
        type: "Point" as const,
        coordinates: [loc.longitude as number, loc.latitude as number]
      }
    }));
    
    sc.load(points);
    return sc;
  }, [locations]);

  // Dapatkan cluster untuk viewport dan zoom saat ini
  const clusters = useMemo(() => {
    if (!bounds) return [];
    return supercluster.getClusters(bounds, Math.floor(viewState.zoom));
  }, [bounds, viewState.zoom, supercluster]);

  // Siapkan data GeoJSON HANYA untuk text label (mengecualikan cluster)
  const geojsonData = useMemo(() => {
    const unclusteredFeatures = clusters.filter(f => !f.properties.cluster).map(f => {
      const props = f.properties;
      const isSelected = activeLocationId === props.locationId;
      const showLabel = isSelected || 
                       (viewState.zoom >= 13) || 
                       (viewState.zoom >= 11 && props.type === 'tps');

      return {
        type: 'Feature',
        geometry: f.geometry,
        properties: {
          id: props.locationId,
          name: showLabel ? props.namaUsaha : "", // Kosongkan nama jika tidak perlu dirender
          type: props.type,
          isSelected: isSelected ? "true" : "false"
        }
      };
    });

    return {
      type: 'FeatureCollection',
      features: unclusteredFeatures
    };
  }, [clusters, activeLocationId, viewState.zoom]);

  // Style untuk Symbol Layer text
  const labelLayerStyle: any = {
    id: 'location-labels',
    type: 'symbol',
    source: 'locations',
    layout: {
      'text-field': ['get', 'name'],
      'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
      'text-size': [
        'match',
        ['get', 'isSelected'],
        'true', 15,
        13
      ],
      'text-variable-anchor': ['left', 'right', 'top', 'bottom'],
      'text-radial-offset': 1.5,
      'text-justify': 'auto',
      'text-allow-overlap': false, // Sembunyikan jika mentok tidak ada celah
    },
    paint: {
      'text-color': [
        'match',
        ['get', 'isSelected'],
        'true', '#b31412', // Merah gelap untuk yang aktif
        [
          'match',
          ['get', 'type'],
          'tps', '#17458f', // Biru untuk TPS
          '#4b5563' // Abu-abu gelap untuk vendor
        ]
      ],
      'text-halo-color': '#ffffff',
      'text-halo-width': 2,
    }
  };

  const handleClusterClick = (clusterId: number, longitude: number, latitude: number) => {
    const expansionZoom = Math.min(supercluster.getClusterExpansionZoom(clusterId), 18);
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [longitude, latitude],
        zoom: expansionZoom,
        duration: 800
      });
    }
  };

  return (
    <div className="absolute inset-0 bg-[#e5e3df] z-0 overflow-hidden">
      <Map
        ref={mapRef}
        {...viewState}
        onLoad={updateBounds}
        onMove={(evt: any) => {
          setViewState(evt.viewState);
          updateBounds();
        }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: "100%", height: "100%" }}
      >
        {/* Layer 1: HTML Markers (Pin biasa & Cluster Pin) */}
        {clusters.map((cluster) => {
          const [longitude, latitude] = cluster.geometry.coordinates;
          const { cluster: isCluster, point_count: pointCount, cluster_id: clusterId } = cluster.properties;

          // Render Bubble Cluster
          if (isCluster) {
            // Skalakan ukuran dan font berdasarkan jumlah isi pin
            const size = Math.min(60, Math.max(36, 30 + (pointCount * 1.5)));
            
            return (
              <Marker
                key={`cluster-${clusterId}`}
                longitude={longitude}
                latitude={latitude}
                anchor="center"
              >
                <div 
                  className="flex items-center justify-center bg-[#17458f]/90 text-white font-bold rounded-full border-2 border-white shadow-[0_0_15px_rgba(23,69,143,0.4)] cursor-pointer hover:bg-blue-800 transition-all hover:scale-110 drop-shadow-md z-40"
                  style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    fontSize: `${pointCount > 99 ? '12px' : '15px'}`
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClusterClick(clusterId, longitude, latitude);
                  }}
                >
                  {pointCount}
                </div>
              </Marker>
            );
          }

          // Render marker Pin individu
          const locId = cluster.properties.locationId;
          const isSelected = activeLocationId === locId;
          
          return (
            <Marker
              key={`marker-${locId}`}
              longitude={longitude}
              latitude={latitude}
              anchor="bottom"
              style={{ zIndex: isSelected ? 50 : 1 }}
            >
              <MapPin 
                type={cluster.properties.type}
                isSelected={isSelected}
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  onMarkerClick(locId);
                }}
              />
            </Marker>
          );
        })}

        {/* Layer 2: Mapbox Symbol Layer (Khusus untuk teks/label cerdas) */}
        <Source id="locations-source" type="geojson" data={geojsonData as any}>
          <Layer {...labelLayerStyle} />
        </Source>
      </Map>
    </div>
  );
}
