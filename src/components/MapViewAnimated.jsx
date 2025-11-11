// src/components/MapViewAnimated.jsx
import React, { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import { io } from "socket.io-client";
import "leaflet/dist/leaflet.css";

/*
  Props:
   - backendUrl: base url to your backend (e.g. "http://localhost:5000")
   - initialCenter: [lat, lon]
   - alerts: array of alert objects (optional) with .location.lat/.location.lon
   - deviceId: device id string to fetch locations for (optional, default "belt001")
*/

const ALERT_ICON = new L.Icon({
  iconUrl: "/alert.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -30],
});

const HUMAN_ICON = new L.Icon({
  iconUrl: "/human.png",
  iconSize: [48, 48],
  iconAnchor: [24, 48],
  popupAnchor: [0, -40],
});

/* small helper to scroll map to center */
function FlyTo({ pos }) {
  const map = useMap();
  useEffect(() => {
    if (pos && map) {
      map.flyTo(pos, map.getZoom(), { duration: 0.8 });
    }
  }, [pos, map]);
  return null;
}

export default function MapViewAnimated({
  backendUrl = "http://localhost:5000",
  initialCenter = [13.1215, 77.6266],
  alerts = [],
  deviceId = "belt001",
}) {
  const socketRef = useRef(null);
  const [humanPos, setHumanPos] = useState(null);        // current live position [lat,lon]
  const [trip, setTrip] = useState([]);                  // array of [lat,lon] for recent trip
  const [loadingTrip, setLoadingTrip] = useState(true);

  // fetch recent locations/trip from backend
  useEffect(() => {
    let mounted = true;
    async function loadTrip() {
      try {
        const q = `${backendUrl.replace(/\/$/, "")}/api/locations?deviceId=${encodeURIComponent(deviceId)}&limit=200`;
        const res = await fetch(q);
        if (!res.ok) throw new Error("failed to fetch locations");
        const data = await res.json();
        // data assumed to be array of docs with location.lat / location.lon
        const pts = data
          .filter((d) => d?.location?.lat != null && d?.location?.lon != null)
          .map((d) => [Number(d.location.lat), Number(d.location.lon)]);
        if (mounted) {
          setTrip(pts.reverse()); // backend may return newest first, reverse so trip is chronological
          if (pts.length) setHumanPos(pts[pts.length - 1]);
        }
      } catch (err) {
        console.warn("MapViewAnimated: loadTrip error", err);
      } finally {
        if (mounted) setLoadingTrip(false);
      }
    }
    loadTrip();
    return () => { mounted = false; };
  }, [backendUrl, deviceId]);

  // setup socket and listen for live location events
  useEffect(() => {
    const base = backendUrl.replace(/\/$/, "");
    const s = io(base, { transports: ["websocket", "polling"] });
    socketRef.current = s;

    const handle = (payload) => {
      // payload may be { deviceId, location: {lat, lon}, time } OR { lat, lon, deviceId }
      if (!payload) return;
      let loc = null;
      if (payload.location && payload.location.lat != null && payload.location.lon != null) {
        loc = [Number(payload.location.lat), Number(payload.location.lon)];
      } else if (payload.lat != null && payload.lon != null) {
        loc = [Number(payload.lat), Number(payload.lon)];
      }
      if (loc) {
        setHumanPos(loc);
        setTrip((t) => {
          const newT = [...t, loc];
          // keep only last 500 points to avoid huge arrays
          if (newT.length > 1000) newT.splice(0, newT.length - 1000);
          return newT;
        });
      }
    };

    // listen common names — adapt if backend uses different name
    s.on("connect", () => console.log("MapViewAnimated socket connected:", s.id));
    s.on("new_location", handle);
    s.on("locationUpdate", handle);
    s.on("location", handle);
    s.on("disconnect", (r) => console.log("MapViewAnimated socket disconnected", r));
    s.on("connect_error", (err) => console.warn("MapViewAnimated socket err", err && err.message));

    return () => {
      s.off("new_location", handle);
      s.off("locationUpdate", handle);
      s.off("location", handle);
      s.disconnect();
      socketRef.current = null;
    };
  }, [backendUrl]);

  // compute polyline color based on presence of points
  const polylineOptions = { color: "#2b8aff", weight: 4, opacity: 0.85 };

  // compute where to center: humanPos else initialCenter
  const center = humanPos || initialCenter;

  return (
    <MapContainer center={center} zoom={15} style={{ height: "100%", width: "100%" }} whenCreated={(m) => setTimeout(() => m.invalidateSize(), 200)}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {/* show alert markers (passed from Dashboard) */}
      {Array.isArray(alerts) &&
        alerts
          .filter((a) => a?.location?.lat != null && a?.location?.lon != null)
          .map((a, i) => (
            <Marker
              key={a._id || `alert-${i}`}
              position={[Number(a.location.lat), Number(a.location.lon)]}
              icon={ALERT_ICON}
            >
              <Popup>
                <div style={{ minWidth: 160 }}>
                  <div style={{ fontWeight: 700 }}>{(a.alertType || "ALERT").toUpperCase()}</div>
                  <div>{a.deviceId || a.device || "device"}</div>
                  <div>{a.time ? new Date(a.time).toLocaleString() : ""}</div>
                  <div style={{ marginTop: 6, color: "#e74c3c", fontWeight: 700 }}>
                    {a.distance ? `${a.distance} cm` : ""}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

      {/* polyline for recent trip */}
      {trip && trip.length > 1 && <Polyline positions={trip} pathOptions={polylineOptions} />}

      {/* human marker */}
      {humanPos && (
        <>
          <Marker position={humanPos} icon={HUMAN_ICON}>
            <Popup>
              <div>
                <div style={{ fontWeight: 700 }}>Person (tracking)</div>
                <div>{humanPos[0].toFixed(6)}, {humanPos[1].toFixed(6)}</div>
                <div style={{ fontSize: 12, color: "#666", marginTop: 6 }}>Live position</div>
              </div>
            </Popup>
          </Marker>
          {/* fly/center map when human position changes */}
          <FlyTo pos={humanPos} />
        </>
      )}
    </MapContainer>
  );
}
