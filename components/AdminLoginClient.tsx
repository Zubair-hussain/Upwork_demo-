"use client";

import { LockKeyhole, LogIn } from "lucide-react";
import { useState } from "react";

export function AdminLoginClient() {
  const [email, setEmail] = useState("thezubairh@gmail.com");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function login() {
    setMessage("Checking admin access...");
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      setMessage("Admin login failed.");
      return;
    }

    window.location.reload();
  }

  return (
    <main className="app-shell secure-shell">
      <section className="candidate-panel secure-card">
        <span className="brand-mark">
          <LockKeyhole size={20} />
        </span>
        <h1>Admin access</h1>
        <p className="muted">Protected LiteSQL admin record with JWT session.</p>
        <div className="field-grid">
          <div className="field">
            <label htmlFor="admin-email">Email</label>
            <input id="admin-email" value={email} onChange={(event) => setEmail(event.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="admin-password">Password</label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Admin password"
            />
          </div>
        </div>
        <button className="btn primary" onClick={login} type="button">
          <LogIn size={16} /> Enter admin
        </button>
        {message ? <p className="muted">{message}</p> : null}
      </section>
    </main>
  );
}
