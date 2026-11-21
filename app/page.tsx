"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const val = email.trim().toLowerCase();

    if (!val) {
      setError("Veuillez saisir votre email.");
      return;
    }

    if (val.includes("agence.com")) {
      router.push("/agence");
    } else if (val.includes("unit_p.com") || val.includes("unit_p")) {
      router.push("/unit_p");
    } else if (val.includes("direction.com")) {
      router.push("/direction");
    } else {
      setError(
        "Email non reconnu. Veuillez entrer un email incluant @agence.com, @unit_p.com ou @direction.com"
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-md border border-gray-200 p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-6">
          Connexion
        </h1>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} noValidate className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError("");
              }}
              placeholder="ex: nom@agence.com, @unit_p.com..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg shadow-sm transition cursor-pointer"
          >
            Se connecter
          </button>
        </form>
      </div>
    </div>
  );
}
