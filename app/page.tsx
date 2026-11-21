"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

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
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between p-4">
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg border border-slate-200/80 p-6 sm:p-8">
          {/* Logo & Titre VMS SMART */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center p-2 rounded-2xl bg-white border border-slate-100 shadow-xs mb-3">
              <Image
                src="/image.png"
                alt="Logo VMS SMART"
                width={80}
                height={80}
                className="h-12 w-auto object-contain"
                priority
              />
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              VMS <span className="text-teal-600">SMART</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Anticipation de la demande & gestion des stocks
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} noValidate className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Adresse email professionnelle
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError("");
                }}
                placeholder="nom@agence.com, @unit_p.com ou @direction.com"
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
              />
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md shadow-teal-600/20 transition cursor-pointer"
            >
              Se connecter
            </button>
          </form>

          {/* Rappel des 3 rôles pour la démo */}
          <div className="mt-5 pt-4 border-t border-slate-100 text-[11px] text-slate-400 text-center">
            Accès par domaine : <span className="font-mono text-slate-600">@agence.com</span> &bull; <span className="font-mono text-slate-600">@unit_p.com</span> &bull; <span className="font-mono text-slate-600">@direction.com</span>
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-slate-400 py-2">
        VMS SMART &bull; Prototype Hackathon VMS Industrie 2026
      </div>
    </div>
  );
}
