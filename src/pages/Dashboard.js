import React, { useEffect, useState } from "react";
import { fetchAlerts } from "../api";
import io from "socket.io-client";
import MapView from "../components/MapView";
import AlertsList from "../components/AlertsList";

const socket = io(process.env.REACT_APP_API_URL || "/");

export default function Dashboard({ onLogout }) {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await fetchAlerts();
      setAlerts(data);
    };
    load();

    socket.on("connect", () => console.log("connected to socket"));
    socket.on("new_alert", (alert) => {
      // show notification popup
      alertPopup(alert);
      setAlerts(prev => [alert, ...prev]);
    });

    return () => {
      socket.off("new_alert");
    };
  }, []);

  function alertPopup(a) {
    // Simple browser notification if allowed
    if (window.Notification && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
    if (window.Notification && Notification.permission === "granted") {
      new Notification(`TrackSure ALERT: ${a.alertType}`, { body: `At ${a.location.lat}, ${a.location.lon}` });
    } else {
      // fallback UI popup
      window.alert(`TrackSure ALERT: ${a.alertType} at ${a.location.lat},${a.location.lon}`);
    }
  }

  return (
    <div>
      <div className="header">
        <h2>TrackSure Dashboard</h2>
        <div>
          <button className="btn" onClick={onLogout}>Logout</button>
        </div>
      </div>
      <div className="container">
        <div className="card">
          <h3>Live Map</h3>
          <MapView alerts={alerts} />
        </div>
        <div className="card" style={{ marginTop:12 }}>
          <h3>Alert History</h3>
          <div className="alert-list"><AlertsList alerts={alerts} /></div>
        </div>
      </div>
    </div>
  );
}
