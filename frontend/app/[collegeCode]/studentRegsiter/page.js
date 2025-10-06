"use client";
import { useState } from "react";

export default function StudentRegisterPage() {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = e => {
    e.preventDefault();
    alert(`Register student: ${JSON.stringify(formData)}`);
    // Implement registration API call here
  };

  return (
    <main style={{ padding: 20, maxWidth: 400, margin: "auto" }}>
      <h1>Student Registration</h1>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <input name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
        <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
        <input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
        <button type="submit" style={{ padding: 12, fontSize: 16 }}>Register</button>
      </form>
    </main>
  );
}
