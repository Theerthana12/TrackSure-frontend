import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import applogo from "../s.png";
import "./Login.css";

function Login({ onLogin }) {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        phone,
        password,
      });
      localStorage.setItem("tracksure_token", res.data.token);
      onLogin();
      navigate("/dashboard");
    } catch (err) {
      alert("Invalid phone or password");
    }
  };

  return (
    <div className="login-page">
      {/* 🔹 Header: Logo + Name */}
      <div className="header" onClick={() => navigate("/")}>
        <img src={applogo} alt="TrackSure Logo" className="app-logo" />
        <h1 className="home-title">TrackSure</h1>
      </div>

      {/* 🔹 Login Card */}
      <div className="login-card">
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />

          <div className="password-container">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "🙈" : "👁️"}
            </span>
          </div>

          <button type="submit">Login</button>
        </form>
        <p>
          Don’t have an account?{" "}
          <span className="link" onClick={() => navigate("/register")}>
            Register
          </span>
        </p>
      </div>
    </div>
  );
}

export default Login;

