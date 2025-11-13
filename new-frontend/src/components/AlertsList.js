import React from "react";

export default function AlertsList({ alerts }) {
  if (!alerts || alerts.length === 0) {
    return <p>No alerts yet.</p>;
  }

  return (
    <div>
      {alerts.map((a, i) => {
        const alertType = a?.alertType ? a.alertType.toUpperCase() : "UNKNOWN ALERT";
        const time = a?.time ? new Date(a.time).toLocaleString() : "No time available";
        const lat = a?.location?.lat ?? "N/A";
        const lon = a?.location?.lon ?? "N/A";
        const distance = a?.distance ? `${a.distance} cm` : "";

        return (
          <div key={i} className="card" style={{ marginBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <b>{alertType}</b> — {time}
              </div>
              <div className="alert-badge">{distance}</div>
            </div>
            <div>Location: {lat}, {lon}</div>
            <div>Device: {a?.deviceId || "Unknown device"}</div>
          </div>
        );
      })}
    </div>
  );
}

