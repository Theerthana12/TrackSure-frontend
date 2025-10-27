import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function MapView({ alerts }) {
  if (!alerts || alerts.length === 0) return <p>No location yet</p>;
  const latest = alerts[0];
  return (
    <MapContainer center={[latest.location.lat, latest.location.lon]} zoom={15} className="map-area">
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {alerts.map((a,i)=>(
        a.location && <Marker key={i} position={[a.location.lat, a.location.lon]}>
          <Popup>{a.alertType} — {new Date(a.time).toLocaleString()}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
