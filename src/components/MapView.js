import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Create a custom alert icon
const alertIcon = new L.Icon({
  iconUrl: "/alert.png",  // must be placed in 'public/alert.png'
  iconSize: [38, 38],     // adjust size as needed
  iconAnchor: [19, 38],   // point of the icon which will correspond to marker's location
  popupAnchor: [0, -35],  // position of the popup relative to the icon
});

export default function MapView({ alerts }) {
  if (!alerts || alerts.length === 0) return <p>No location yet</p>;

  const latest = alerts[0];
  const hasLocation = latest?.location && latest.location.lat && latest.location.lon;

  if (!hasLocation) {
    return <p>Waiting for valid location data...</p>;
  }

  return (
    <MapContainer
      center={[latest.location.lat, latest.location.lon]}
      zoom={15}
      className="map-area"
      style={{ height: "400px", width: "100%", borderRadius: "10px" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {alerts.map((a, i) =>
        a.location && a.location.lat && a.location.lon ? (
          <Marker
            key={i}
            position={[a.location.lat, a.location.lon]}
            icon={alertIcon}
          >
            <Popup>
              ⚠️ <strong>{a.alertType.toUpperCase()}</strong><br />
              Device: {a.deviceId}<br />
              Time: {new Date(a.time).toLocaleString()}<br />
              Location: {a.location.lat}, {a.location.lon}
            </Popup>
          </Marker>
        ) : null
      )}
    </MapContainer>
  );
}
