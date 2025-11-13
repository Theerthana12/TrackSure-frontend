import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Register.css";
import applogo from "../s.png";

function Register() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Clear autofill when page loads
  useEffect(() => {
    setName("");
    setPhone("");
    setPassword("");
  }, []);

  // Indian 10-digit validation
  const isValidPhone = (p) => /^[6-9]\d{9}$/.test(p);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!name || name.trim().length < 2) {
      alert("Please enter a valid name.");
      return;
    }

    if (!isValidPhone(phone)) {
      alert("Enter a valid 10-digit Indian mobile number.");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    try {
      await axios.post((process.env.REACT_APP_API_URL || "http://localhost:5000") + "/api/auth/register", {
        name,
        phone,
        password,
      });

      alert("Registration successful! Please login.");
      navigate("/login");
    } 
    catch(err) {
      const serverMsg = err?.response?.data?.error || err?.response?.data?.message || err.message || "Registration failed. Try again.";
      alert(serverMsg);
    }
  
  };

  return (
    <div className="login-page">
      <div className="header" onClick={() => navigate("/")}>
        <img src={applogo} alt="TrackSure Logo" className="app-logo" />
        <h1 className="home-title">TrackSure</h1>
      </div>

      <div className="login-card">
        <h2>Register</h2>

        <form onSubmit={handleRegister} autoComplete="off">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            type="text"
            name="phone"
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
            autoComplete="tel"
            required
          />

          <div className="password-container">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
            />

            <span
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Ìπà" : "Ì±ÅÔ∏è"}
            </span>
          </div>

          <button type="submit">Register</button>
        </form>

        <p>
          Already have an account?{" "}
          <span className="link" onClick={() => navigate("/login")}>
            Login
          </span>
        </p>
      </div>
    </div>
  );
}

export default Register;
