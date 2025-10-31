import React from "react";
import { useNavigate } from "react-router-dom";
import "../pages/DefaultPage.css";
import logo from "../s.png";
import background from "../s.png";

function DefaultPage() {
  const navigate = useNavigate();

  return (
    <div
      className="default-container"
      style={{ backgroundImage: `url(${background})` }}
    >
      <div className="default-header">
        <img src={logo} alt="TrackSure logo" className="default-logo" />
        <h1 className="default-title">TrackSure</h1>
      </div>

      <div className="default-card-container">
        <div className="default-card" onClick={() => navigate("/home")}>
          <h2>Start</h2>
          <p>Begin exploring the features of TrackSure.</p>
        </div>

        <div className="default-card" onClick={() => navigate("/dashboard")}>
          <h2>Enter</h2>
          <p>Go directly to your dashboard .</p>
        </div>
      </div>
    </div>
  );
}

export default DefaultPage;

