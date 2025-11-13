import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import applogo from "../s.png";
import "./Login.css";

function Login({ onLogin }) {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Clear any autofilled values on mount
  useEffect(() => {
    setPhone("");
    setPassword("");
  }, []);

  // Indian mobile validation: start with 6-9 and total 10 digits
  const isValidPhone = (p) => /^[6-9]\d{9}$/.test(p);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!isValidPhone(phone)) {
      alert("Enter a valid 10-digit mobile number (India).");
      return;
    }
    if (!password || password.length < 4) {
      alert("Enter a valid password.");
      return;
    }

    try {
      const res = await axios.post(
        (process.env.REACT_APP_API_URL || "http://localhost:5000") + "/api/auth/login",
        {
          phone,
          password,
        }
      );
      localStorage.setItem("tracksure_token", res.data.token);
      onLogin && onLogin();
      navigate("/dashboard");
    } catch (err) {
      alert("Invalid phone or password");
    }
  };

  return (
    <div className="login-page">
      {/* Ì¥π Header: Logo + Name */}
      <div className="header" onClick={() => navigate("/")}>
        <img src={applogo} alt="TrackSure Logo" className="app-logo" />
        <h1 className="home-title">TrackSure</h1>
      </div>

      {/* Ì¥π Login Card */}
      <div className="login-card">
        <h2>Login</h2>
        <form onSubmit={handleLogin} autoComplete="off">
          <input
            name="phone"
            autoComplete="tel"
            type="text"
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
            required
          />

          <div className="password-container">
            <input
              name="password"
              autoComplete="new-password"
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
              {showPassword ? "Ìπà" : "Ì±Å"}
            </span>
          </div>

          <button type="submit">Login</button>
        </form>
        <p>
          Don‚Äôt have an account?{" "}
          <span className="link" onClick={() => navigate("/register")}>
            Register
          </span>
        </p>
      </div>
    </div>
  );
}

export default Login;
