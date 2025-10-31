import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { io } from "socket.io-client";
import "leaflet/dist/leaflet.css";
import applogo from "../s.png";
import "./Dashboard.css"; // 👈 imported CSS

const ALERT_ICON = new L.Icon({
  iconUrl: "/alert.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -38],
});

const DEFAULT_CENTER = [13.1215, 77.6266];

export default function Dashboard({ onLogout }) {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const socketRef = useRef(null);

  const BACKEND =
    process.env.REACT_APP_API_URL?.replace(/\/$/, "") ||
    "http://192.168.1.2:5000";

  useEffect(() => {
    let mounted = true;
    async function loadAlerts() {
      try {
        const r = await fetch(`${BACKEND}/api/alerts`);
        if (!r.ok) throw new Error("Failed to fetch alerts");
        const data = await r.json();
        data.sort((a, b) => new Date(b.time) - new Date(a.time));
        if (mounted) {
          setAlerts(data);
          const firstWithLoc = data.find(
            (x) => x.location && x.location.lat && x.location.lon
          );
          if (firstWithLoc)
            setMapCenter([firstWithLoc.location.lat, firstWithLoc.location.lon]);
        }
      } catch (err) {
        console.error("Load alerts error:", err);
      }
    }
    loadAlerts();
    return () => {
      mounted = false;
    };
  }, [BACKEND]);

  useEffect(() => {
    const socket = io(BACKEND, {
      transports: ["websocket", "polling"],
      reconnectionAttempts: 10,
      timeout: 20000,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("⚡️ Socket connected:", socket.id);
    });

    socket.on("connect_error", (err) => {
      console.warn("Socket connection error:", err.message || err);
    });

    const handleNew = (alert) => {
      console.log("Socket new alert:", alert);
      const normalized = { ...alert };
      if (!normalized.location && (alert.lat || alert.latitude)) {
        normalized.location = {
          lat: alert.lat || alert.latitude,
          lon: alert.lon || alert.longitude,
        };
      }
      setAlerts((prev) => [normalized, ...prev]);
      const lat = normalized.location?.lat;
      const lon = normalized.location?.lon;
      if (lat && lon) setMapCenter([lat, lon]);
    };

    socket.on("new_alert", handleNew);
    socket.on("alertData", handleNew);

    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });

    return () => {
      socket.off("new_alert", handleNew);
      socket.off("alertData", handleNew);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [BACKEND]);

  function formatTime(t) {
    try {
      const d = new Date(t);
      return d.toLocaleString();
    } catch {
      return t || "";
    }
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <img src={applogo} alt="TrackSure Logo" className="app-logo" />
          <h1 className="site-title">TrackSure</h1>
        </div>

        <div className="header-buttons">
          <button className="back-btn" onClick={() => navigate("/default")}>
            ← Back
          </button>
          <button
            className="logout-btn"
            onClick={() => {
              localStorage.removeItem("tracksure_token");
              if (onLogout) onLogout();
              navigate("/");
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="dashboard-main">
        <section className="map-section">
          <MapContainer
            center={mapCenter}
            zoom={15}
            style={{ height: "100%", width: "100%" }}
            whenCreated={(map) => setTimeout(() => map.invalidateSize(), 300)}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {alerts
              .filter(
                (a) =>
                  a?.location?.lat != null &&
                  a?.location?.lon != null &&
                  !isNaN(Number(a.location.lat)) &&
                  !isNaN(Number(a.location.lon))
              )
              .map((a, i) => (
                <Marker
                  key={a._id || i}
                  position={[a.location.lat, a.location.lon]}
                  icon={ALERT_ICON}
                >
                  <Popup>
                    <div className="popup-content">
                      <strong>{a.alertType?.toUpperCase() || "ALERT"}</strong>
                      <div>{a.deviceId || a.device || "belt001"}</div>
                      <div>{formatTime(a.time)}</div>
                      <div>
                        {a.location.lat.toFixed(6)}, {a.location.lon.toFixed(6)}
                      </div>
                      <div className="popup-distance">
                        {a.distance ? `${a.distance} cm` : ""}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
          </MapContainer>
        </section>

        <section className="alerts-section">
          <h2>Live Alerts</h2>
          <div className="alerts-list">
            {alerts.length === 0 ? (
              <p className="no-alerts">No alerts yet...</p>
            ) : (
              alerts.map((a, i) => (
                <div key={a._id || i} className="alert-card">
                  <div className="alert-top">
                    <span className="alert-type">
                      {a.alertType || "obstacle"}
                    </span>
                    <span className="alert-distance">
                      {a.distance ? `${a.distance} cm` : "—"}
                    </span>
                  </div>
                  <div className="alert-info">
                    <div>
                      <strong>Device:</strong> {a.deviceId || a.device || "belt001"}
                    </div>
                    <div>
                      <strong>Time:</strong> {formatTime(a.time)}
                    </div>
                    <div>
                      <strong>Location:</strong>{" "}
                      {a.location?.lat && a.location?.lon
                        ? `${a.location.lat.toFixed(6)}, ${a.location.lon.toFixed(6)}`
                        : "unknown"}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
