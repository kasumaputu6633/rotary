"use client";

import Map, { Marker, MapRef } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { useState, useRef, useEffect } from "react";
import MapPin from "./MapPin";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

interface MapContainerProps {
  markers: Array<{id: string, lat: number, lng: number, type: 'tps' | 'vendor', name: string, labelPosition?: 'left' | 'right'}>;
  onMarkerClick: (locationId: string) => void;
  activeLocationId: string | null;
}

export default function MapContainer({ markers, onMarkerClick, activeLocationId }: MapContainerProps) {
  const mapRef = useRef<MapRef>(null);

  const [viewState, setViewState] = useState({
    longitude: 115.1889, // Bali longitude
    latitude: -8.4095, // Bali latitude
    zoom: 10
  });

  // Efek untuk memfokuskan (terbang) peta ke lokasi yang dipilih
  useEffect(() => {
    if (activeLocationId && mapRef.current) {
      const marker = markers.find(m => m.id === activeLocationId);
      if (marker) {
        mapRef.current.flyTo({
          center: [marker.lng, marker.lat],
          zoom: 13, // Zoom level yang lebih dekat (10 -> 13)
          duration: 1200, // Durasi animasi terbang (1.2 detik)
          essential: true
        });
      }
    }
  }, [activeLocationId, markers]);

  return (
    <div className="absolute inset-0 bg-[#e5e3df] z-0 overflow-hidden">
      <Map
        ref={mapRef}
        {...viewState}
        onMove={(evt: any) => setViewState(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: "100%", height: "100%" }}
      >
        {markers.map((marker) => {
          const isSelected = activeLocationId === marker.id;

          return (
            <Marker
              key={marker.id}
              longitude={marker.lng}
              latitude={marker.lat}
              anchor="bottom"
              style={{ zIndex: isSelected ? 50 : 1 }}
            >
              <MapPin 
                type={marker.type}
                name={marker.name}
                isSelected={isSelected}
                labelPosition={marker.labelPosition}
                currentZoom={viewState.zoom}
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  onMarkerClick(marker.id);
                }}
              />
            </Marker>
          );
        })}
      </Map>
    </div>
  );
}
