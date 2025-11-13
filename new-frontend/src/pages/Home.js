import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import logo from "../s.png"; // image stored in src/applogo.png

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      {/* Header with clickable logo + title */}
      <header className="home-header" onClick={() => navigate("/")}>
        <img src={logo} alt="TrackSure Logo" className="home-logo" />
        <h1 className="home-title">TrackSure</h1>
      </header>

      {/* Card section in center */}
      <div className="card-container">
        <div className="home-card">
          <h2>Login</h2>
          <p>Access your account and track in real time.</p>
          <button onClick={() => navigate("/login")}>Login</button>
        </div>

        <div className="home-card">
          <h2>Register</h2>
          <p>Create your account to get started with TrackSure.</p>
          <button onClick={() => navigate("/register")}>Register</button>
        </div>
      </div>
    </div>
  );
}

export default Home;

