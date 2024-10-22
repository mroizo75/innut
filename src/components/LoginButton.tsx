"use client";

import { useState } from "react";

export default function LoginButton() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const result = await response.json();

    if (result.error) {
      alert(`Innlogging feilet: ${result.error}`);
    } else {
      alert("Innlogging vellykket");
      // Omdiriger brukeren til dashbordet eller ønsket side
      window.location.href = "/dashboard";
    }
  };

  return (
    <div>
      <input
        type="email"
        placeholder="E-post"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Passord"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin}>Logg inn</button>
    </div>
  );
}