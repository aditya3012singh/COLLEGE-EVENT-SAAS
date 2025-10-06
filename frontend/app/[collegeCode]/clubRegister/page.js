"use client";
import { useState } from "react";

export default function ClubRegisterPage() {
  const [formData, setFormData] = useState({ clubName: "", email: "", password: "" });

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = e => {
    e.preventDefault();
    alert(`Register club: ${JSON.stringify(formData)}`);
    // Implement registration API call here
  };

  return (
    <main style={{ padding: 20, maxWidth: 400, margin: "auto" }}>
      <h1>Club Registration</h1>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <input name="clubName" placeholder="Club Name" value={formData.clubName} onChange={handleChange} required />
        <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
        <input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
        <button type="submit" style={{ padding: 12, fontSize: 16 }}>Register</button>
      </form>
    </main>
  );
}
