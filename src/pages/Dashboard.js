import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Polyline, Popup } from "react-leaflet";
import L from "leaflet";
import { io } from "socket.io-client";
import "leaflet/dist/leaflet.css";
import "./Dashboard.css";
import applogo from "../s.png";

// Marker icons
const ALERT_ICON = new L.Icon({
  iconUrl: "/alert.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});
const HUMAN_ICON = new L.Icon({
  iconUrl: "/human.png",
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

const DEFAULT_CENTER = [13.1215, 77.6266];

export default function Dashboard({ onLogout }) {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [maxBox, setMaxBox] = useState(null);
  const socketRef = useRef(null);

  const BACKEND =
    process.env.REACT_APP_API_URL?.replace(/\/$/, "") ||
    "http://10.103.113.104:5000";

  useEffect(() => {
    const socket = io(BACKEND, { transports: ["websocket", "polling"] });
    socketRef.current = socket;

    // Fetch initial data
    fetch(`${BACKEND}/api/alerts`)
      .then((r) => r.json())
      .then((data) => {
        data.sort((a, b) => new Date(b.time) - new Date(a.time));
        setAlerts(data);
      });

    fetch(`${BACKEND}/api/locations?limit=100`)
      .then((r) => r.json())
      .then((data) => setLocations(data));

    socket.on("new_alert", (a) => {
      setAlerts((prev) => [a, ...prev]);
      playBeep();
    });
    socket.on("alertData", (a) => setAlerts((prev) => [a, ...prev]));
    socket.on("location_update", (loc) =>
      setLocations((prev) => [...prev, loc].slice(-200))
    );

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [BACKEND]);

  const latest = locations[locations.length - 1];
  const humanPos =
    latest && latest.location?.lat && latest.location?.lon
      ? [latest.location.lat, latest.location.lon]
      : DEFAULT_CENTER;

  const playBeep = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      osc.frequency.value = 600;
      osc.connect(ctx.destination);
      osc.start();
      setTimeout(() => osc.stop(), 150);
    } catch {}
  };

  const formatTime = (t) => (t ? new Date(t).toLocaleString() : "—");

  return (
    <div className={`dashboard ${maxBox ? "scroll-enabled" : "no-scroll"}`}>
      <header className="dashboard-header">
        <div className="header-left">
          <img src={applogo} alt="TrackSure Logo" className="app-logo" />
          <h1>TrackSure Dashboard</h1>
        </div>
        <div className="header-right">
          <button onClick={() => navigate("/default")}>← Back</button>
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

      <div className={`grid-container small ${maxBox ? "blur-others" : ""}`}>
        {/* 🧍 Live Tracking */}
        <div className={`grid-box ${maxBox === "tracking" ? "centered" : ""}`}>
          <div className="box-header">
            <h2>🧍 Live Tracking</h2>
            <button
              onClick={() => setMaxBox(maxBox === "tracking" ? null : "tracking")}
            >
              {maxBox === "tracking" ? "–" : "🔍"}
            </button>
          </div>
          <MapContainer center={mapCenter} zoom={15} style={{ height: "100%" }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {locations.length > 1 && (
              <Polyline
                positions={locations.map((l) => [
                  l.location.lat,
                  l.location.lon,
                ])}
                color="cyan"
                weight={3}
              />
            )}
            {humanPos && (
              <Marker position={humanPos} icon={HUMAN_ICON}>
                <Popup>Current Position</Popup>
              </Marker>
            )}
          </MapContainer>
        </div>

        {/* ⚠️ Obstacle Location */}
        <div className={`grid-box ${maxBox === "obstacle" ? "centered" : ""}`}>
          <div className="box-header">
            <h2>⚠️ Obstacle Location</h2>
            <button
              onClick={() => setMaxBox(maxBox === "obstacle" ? null : "obstacle")}
            >
              {maxBox === "obstacle" ? "–" : "🔍"}
            </button>
          </div>
          <MapContainer center={mapCenter} zoom={15} style={{ height: "100%" }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {alerts.map(
              (a, i) =>
                a.location && (
                  <Marker
                    key={i}
                    position={[a.location.lat, a.location.lon]}
                    icon={ALERT_ICON}
                  >
                    <Popup>
                      <strong>{a.alertType}</strong>
                      <br />
                      {a.distance} cm<br />
                      {formatTime(a.time)}
                    </Popup>
                  </Marker>
                )
            )}
          </MapContainer>
        </div>

        {/* 🗺️ Recent Trip */}
        <div className={`grid-box ${maxBox === "trip" ? "centered" : ""}`}>
          <div className="box-header">
            <h2>🗺️ Recent Trip</h2>
            <button
              onClick={() => setMaxBox(maxBox === "trip" ? null : "trip")}
            >
              {maxBox === "trip" ? "–" : "🔍"}
            </button>
          </div>
          <MapContainer center={mapCenter} zoom={15} style={{ height: "100%" }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {locations.length > 1 && (
              <Polyline
                positions={locations.map((l) => [
                  l.location.lat,
                  l.location.lon,
                ])}
                color="lime"
                weight={3}
              />
            )}
            {humanPos && (
              <Marker position={humanPos} icon={HUMAN_ICON}>
                <Popup>Current Position</Popup>
              </Marker>
            )}
          </MapContainer>
        </div>

        {/* 📜 Live Alerts */}
        <div className={`grid-box ${maxBox === "alerts" ? "centered" : ""}`}>
          <div className="box-header">
            <h2>📜 Live Alerts</h2>
            <button
              onClick={() => setMaxBox(maxBox === "alerts" ? null : "alerts")}
            >
              {maxBox === "alerts" ? "–" : "🔍"}
            </button>
          </div>
          <div className="alerts-list">
            {alerts.map((a, i) => (
              <div key={i} className="alert-card">
                <div className="alert-type">{a.alertType}</div>
                <div>📏 {a.distance} cm</div>
                <div>
                  📍{" "}
                  <a
                    href={`https://www.google.com/maps?q=${a.location.lat},${a.location.lon}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="map-link"
                  >
                    View on Google Maps
                  </a>
                </div>
                <div>🕒 {formatTime(a.time)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


