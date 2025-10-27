import React, { useEffect, useState } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import 'leaflet/dist/leaflet.css';


function App() {
  const token = localStorage.getItem("tracksure_token");
  const [user, setUser] = useState(token ? true : null); // simple flag

  useEffect(() => {
    const t = localStorage.getItem("tracksure_token");
    setUser(!!t);
  }, []);

  if (!user) {
    // show login / register
    return (
      <div>
        <div className="header"><h2>TrackSure</h2></div>
        <div className="container">
          <Login onLogin={() => setUser(true)} />
          <hr />
          <Register onRegister={() => setUser(true)} />
        </div>
      </div>
    );
  }

  return <Dashboard onLogout={() => { localStorage.removeItem("tracksure_token"); setUser(false); }} />;
}

export default App;
