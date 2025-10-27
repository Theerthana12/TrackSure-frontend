import React from "react";

export default function AlertsList({ alerts }) {
  if (!alerts) return null;
  return (
    <div>
      {alerts.map((a, i) => (
        <div key={i} className="card" style={{ marginBottom:8 }}>
          <div style={{ display:"flex", justifyContent:"space-between" }}>
            <div><b>{a.alertType.toUpperCase()}</b> — {new Date(a.time).toLocaleString()}</div>
            <div className="alert-badge">{a.distance ? `${a.distance} cm` : ""}</div>
          </div>
          <div>Location: {a.location?.lat}, {a.location?.lon}</div>
          <div>Device: {a.deviceId}</div>
        </div>
      ))}
    </div>
  );
}
