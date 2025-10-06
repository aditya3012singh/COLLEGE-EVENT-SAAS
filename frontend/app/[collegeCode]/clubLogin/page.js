"use client";
import { useState } from "react";

export default function ClubLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = e => {
    e.preventDefault();
    alert(`Club logging in with ${email}`);
    // Implement club login logic here
  };

  return (
    <main style={{ padding: 20, maxWidth: 400, margin: "auto" }}>
      <h1>Club Login</h1>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
        <button type="submit" style={{ padding: 12, fontSize: 16 }}>Login</button>
      </form>
    </main>
  );
}
