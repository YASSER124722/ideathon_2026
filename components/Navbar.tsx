"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import {
  Building2,
  Factory,
  Compass,
  LogOut,
  ChevronDown,
  Bell,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Shield,
  User,
} from "lucide-react";
import { getSession, clearSession, DEMO_ACCOUNTS, UserSession } from "@/lib/auth";

interface NavbarProps {
  currentRole: "agence" | "unit_p" | "direction";
}

export default function Navbar({ currentRole }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<UserSession | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3);

  useEffect(() => {
    const s = getSession();
    if (s) {
      setSession(s);
    }
  }, []);

  const handleLogout = () => {
    clearSession();
    router.push("/");
  };

  const getRoleConfig = () => {
    switch (currentRole) {
      case "agence":
        return {
          label: "Espace Agence",
          icon: Building2,
          badgeClass: "bg-blue-50 text-blue-700 border-blue-200 ring-blue-500/20",
          accentColor: "blue",
          subtitle: "Gestion commerciale & relation client",
        };
      case "unit_p":
        return {
          label: "Unités de Production",
          icon: Factory,
          badgeClass: "bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/20",
          accentColor: "amber",
          subtitle: "Pilotage usines, lignes & cadence",
        };
      case "direction":
        return {
          label: "Direction Générale",
          icon: Compass,
          badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20",
          accentColor: "emerald",
          subtitle: "Vision stratégique & gouvernance",
        };
    }
  };

  const roleConfig = getRoleConfig();
  const RoleIcon = roleConfig.icon;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      {/* Top micro bar for Ideathon quick testing / role switching */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 sm:px-8 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            MODE PROTOTYPE UI
          </span>
          <span className="hidden sm:inline text-slate-400">
            Connexion dynamique par domaine email :
          </span>
          <span className="font-mono text-slate-300 text-[11px]">
            @agence.com &bull; @unit_p.com &bull; @direction.com
          </span>
        </div>

        {/* Quick Role Switcher pills */}
        <div className="flex items-center gap-1.5">
          <span className="hidden md:inline text-slate-400 text-[11px] mr-1">
            Basculer en 1-clic :
          </span>
          {DEMO_ACCOUNTS.map((acc) => {
            const isActive = currentRole === acc.role;
            return (
              <Link
                key={acc.role}
                href={acc.portalPath}
                className={`px-2 py-0.5 rounded text-[11px] transition font-medium flex items-center gap-1 ${
                  isActive
                    ? "bg-slate-100 text-slate-900 font-semibold shadow-xs"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <span>{acc.role === "agence" ? "Agence" : acc.role === "unit_p" ? "Production" : "Direction"}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Portal Title */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center p-1 shadow-xs">
              <Image
                src="/image.png"
                alt="Logo VMS SMART"
                width={36}
                height={36}
                className="h-8 w-auto object-contain"
                priority
              />
            </div>
            <div>
              <div className="font-extrabold text-slate-900 tracking-tight text-base leading-none">
                VMS <span className="text-[#D90016] font-extrabold">SMART</span>
              </div>
              <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mt-0.5">
                Gestion des stocks & prévisions
              </div>
            </div>
          </Link>

          <div className="h-6 w-px bg-slate-200 hidden sm:block" />

          {/* Current Space Badge */}
          <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border ring-1 text-xs font-semibold ${roleConfig.badgeClass}`}>
            <RoleIcon className="w-4 h-4 shrink-0" />
            <span>{roleConfig.label}</span>
          </div>
        </div>

        {/* Right side items: Actions, User Info & Logout */}
        <div className="flex items-center gap-3">
          {/* Notifications bell */}
          <button
            onClick={() => setNotificationCount(0)}
            title="Notifications"
            className="relative p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
          >
            <Bell className="w-5 h-5" />
            {notificationCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-white" />
            )}
          </button>

          {/* User profile dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-2.5 p-1.5 pr-2.5 rounded-xl hover:bg-slate-100 border border-slate-200/80 transition text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {session?.avatar || (currentRole === "agence" ? "AG" : currentRole === "unit_p" ? "UP" : "DG")}
              </div>
              <div className="hidden md:block">
                <div className="text-xs font-semibold text-slate-800 leading-tight">
                  {session?.name || (currentRole === "agence" ? "Agent Commercial" : currentRole === "unit_p" ? "Responsable Usine" : "Direction Générale")}
                </div>
                <div className="text-[10px] text-slate-500 font-mono leading-tight">
                  {session?.email || (currentRole === "agence" ? "agent@agence.com" : currentRole === "unit_p" ? "chef@unit_p.com" : "direction@direction.com")}
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {/* Menu Popover */}
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 text-xs">
                <div className="px-3 py-2 border-b border-slate-100">
                  <p className="font-semibold text-slate-900">{session?.name || "Session Utilisateur"}</p>
                  <p className="text-slate-500 font-mono text-[11px] truncate">
                    {session?.email || (currentRole === "agence" ? "agent@agence.com" : currentRole === "unit_p" ? "chef@unit_p.com" : "direction@direction.com")}
                  </p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">
                    {roleConfig.label}
                  </span>
                </div>

                <div className="py-1">
                  <div className="px-3 py-1.5 text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                    Espaces autorisés
                  </div>
                  {DEMO_ACCOUNTS.map((acc) => (
                    <Link
                      key={acc.role}
                      href={acc.portalPath}
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-between px-3 py-2 text-slate-700 hover:bg-slate-50 transition"
                    >
                      <span className={currentRole === acc.role ? "font-semibold text-indigo-600" : ""}>
                        {acc.roleLabel}
                      </span>
                      {currentRole === acc.role && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />}
                    </Link>
                  ))}
                </div>

                <div className="border-t border-slate-100 pt-1 mt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 flex items-center gap-2 transition"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Se déconnecter (Page d&apos;accueil)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
