import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import DefaultPage from "./pages/DefaultPage"; // new landing page
import "leaflet/dist/leaflet.css";
import "./App.css";

function App() {
  const token = localStorage.getItem("tracksure_token");
  const [user, setUser] = useState(token ? true : null);

  useEffect(() => {
    const t = localStorage.getItem("tracksure_token");
    setUser(!!t);
  }, []);

  return (
    <Router>
      <Routes>
        {/* Default landing page */}
        <Route path="/" element={<DefaultPage />} />

        {/* Home page (after entering from landing page) */}
        <Route path="/home" element={<Home />} />

        {/* Auth pages */}
        <Route
          path="/login"
          element={<Login onLogin={() => setUser(true)} />}
        />
        <Route
          path="/register"
          element={<Register onRegister={() => setUser(true)} />}
        />

        {/* Dashboard (protected route) */}
        <Route
          path="/dashboard"
          element={
            user ? (
              <Dashboard
                onLogout={() => {
                  localStorage.removeItem("tracksure_token");
                  setUser(false);
                }}
              />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Fallback: if route not found */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
