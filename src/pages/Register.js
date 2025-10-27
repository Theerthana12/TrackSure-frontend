import React, { useState } from "react";
import { register } from "../api";

export default function Register({ onRegister }) {
  const [name,setName]=useState("");
  const [phone,setPhone]=useState("");
  const [password,setPassword]=useState("");
  const [care,setCare]=useState("");
  const [msg,setMsg]=useState("");

  const submit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await register({ name, phone, password, caregiverPhone: care });
      localStorage.setItem("tracksure_token", data.token);
      onRegister();
    } catch (err) {
      setMsg(err.response?.data?.msg || "Registration failed");
    }
  };

  return (
    <div className="card login-form">
      <h3>Register</h3>
      <form onSubmit={submit}>
        <div className="form-field"><input placeholder="Name" value={name} onChange={e=>setName(e.target.value)} /></div>
        <div className="form-field"><input placeholder="Phone" value={phone} onChange={e=>setPhone(e.target.value)} /></div>
        <div className="form-field"><input placeholder="Caregiver Phone" value={care} onChange={e=>setCare(e.target.value)} /></div>
        <div className="form-field"><input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} /></div>
        <button className="btn" type="submit">Register</button>
        <p style={{color:'red'}}>{msg}</p>
      </form>
    </div>
  );
}
