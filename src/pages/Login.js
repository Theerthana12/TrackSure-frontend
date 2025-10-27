import React, { useState } from "react";
import { login } from "../api";

export default function Login({ onLogin }) {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await login({ phone, password });
      localStorage.setItem("tracksure_token", data.token);
      onLogin();
    } catch (err) {
      setMsg(err.response?.data?.msg || "Login failed");
    }
  };

  return (
    <div className="card login-form">
      <h3>Login</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <input placeholder="Phone" value={phone} onChange={e=>setPhone(e.target.value)} />
        </div>
        <div className="form-field">
          <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
        </div>
        <button className="btn" type="submit">Login</button>
        <p style={{color:'red'}}>{msg}</p>
      </form>
    </div>
  );
}
