import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import type { EruvLocation } from "@/hooks/useEruvLocations";

const kosherIcon = new L.DivIcon({
  className: "eruv-marker",
  html: `<div style="width:32px;height:32px;border-radius:50%;background:#059669;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;"><span style="color:white;font-size:16px;font-weight:bold;">✓</span></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const notKosherIcon = new L.DivIcon({
  className: "eruv-marker",
  html: `<div style="width:32px;height:32px;border-radius:50%;background:#DC2626;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;"><span style="color:white;font-size:16px;font-weight:bold;">✗</span></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

function FlyToCity({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.flyTo([lat, lng], 13, { duration: 1 });
    }
  }, [lat, lng, map]);
  return null;
}

interface EruvMapProps {
  locations: EruvLocation[];
  onMarkerClick: (location: EruvLocation) => void;
  selectedCity?: { lat: number; lng: number } | null;
}

export default function EruvMap({ locations, onMarkerClick, selectedCity }: EruvMapProps) {
  return (
    <MapContainer
      center={[31.5, 34.85]}
      zoom={8}
      className="h-full w-full z-0"
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {selectedCity && <FlyToCity lat={selectedCity.lat} lng={selectedCity.lng} />}
      {locations.map((loc) => (
        <Marker
          key={loc.id}
          position={[loc.lat, loc.lng]}
          icon={loc.status === "kosher" ? kosherIcon : notKosherIcon}
          eventHandlers={{
            click: () => onMarkerClick(loc),
          }}
        />
      ))}
    </MapContainer>
  );
}
