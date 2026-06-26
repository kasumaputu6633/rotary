"use client";

import Map, { Marker, MapRef } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { Icon } from "@iconify/react";
import { useState, useRef, useEffect } from "react";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

interface MapContainerProps {
  onMarkerClick: (locationId: string) => void;
  activeLocationId: string | null;
}

export default function MapContainer({ onMarkerClick, activeLocationId }: MapContainerProps) {
  const mapRef = useRef<MapRef>(null);
  
  const [viewState, setViewState] = useState({
    longitude: 115.1889, // Bali longitude
    latitude: -8.4095, // Bali latitude
    zoom: 10
  });

  const dummyMarkers = [
    { id: "1", lat: -8.5, lng: 115.2, type: "tps", name: "TPS Denpasar" },
    { id: "2", lat: -8.4, lng: 115.1, type: "vendor", name: "Vendor Tabanan" },
  ];

  // Efek untuk memfokuskan (terbang) peta ke lokasi yang dipilih
  useEffect(() => {
    if (activeLocationId && mapRef.current) {
      const marker = dummyMarkers.find(m => m.id === activeLocationId);
      if (marker) {
        mapRef.current.flyTo({
          center: [marker.lng, marker.lat],
          zoom: 13, // Zoom level yang lebih dekat (10 -> 13)
          duration: 1200, // Durasi animasi terbang (1.2 detik)
          essential: true
        });
      }
    }
  }, [activeLocationId]);

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
        {dummyMarkers.map((marker) => {
          const isSelected = activeLocationId === marker.id;
          
          // Warna: Merah jika terpilih, Biru tua jika TPS, Hijau jika Vendor
          const bgColor = isSelected ? 'bg-red-500' : (marker.type === 'tps' ? 'bg-[#17458f]' : 'bg-green-600');
          const borderColor = isSelected ? 'border-t-red-500' : (marker.type === 'tps' ? 'border-t-[#17458f]' : 'border-t-green-600');

          return (
            <Marker 
              key={marker.id} 
              longitude={marker.lng} 
              latitude={marker.lat}
              anchor="bottom"
              style={{ zIndex: isSelected ? 50 : 1 }}
              onClick={(e: any) => {
                e.originalEvent.stopPropagation();
                onMarkerClick(marker.id);
              }}
            >
              {/* Desain Pin Kustom */}
              <div 
                className={`cursor-pointer transform transition-all duration-300 flex flex-col items-center drop-shadow-md origin-bottom ${
                  isSelected ? 'scale-150 drop-shadow-2xl' : 'hover:scale-110'
                }`}
              >
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 border-white transition-colors duration-300 ${bgColor}`}>
                  <Icon 
                    icon={marker.type === 'tps' ? "mdi:storefront" : "mdi:recycle"} 
                    className="w-4 h-4 text-white" 
                  />
                </div>
                {/* Segitiga bawah pin */}
                <div className={`w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] transition-colors duration-300 ${borderColor}`}></div>
              </div>
            </Marker>
          );
        })}
      </Map> 
    </div>
  );
}
