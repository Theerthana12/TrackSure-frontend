import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import applogo from "../../s.png";
import "./Login.css";

function Login({ onLogin }) {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
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
      <div className="header" onClick={() => navigate("/")}>
        <img src={applogo} alt="TrackSure Logo" className="app-logo" />
        <h1 className="home-title">TrackSure</h1>
      </div>

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
            <span className="toggle-password" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"} role="button">
  {showPassword ? (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 3l18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10.58 10.58A3 3 0 0 0 13.42 13.42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M21.6 12.14c-1.84 3.37-6.03 6.36-9.6 6.36-2.35 0-4.49-1.04-6.04-2.64" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ) : (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
    </svg>
  )}
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
