"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PackageSearch,
  ArrowRightLeft,
  TrendingUp,
  Bell,
  LogOut,
  ChevronDown,
  Gauge,
  Shield,
} from "lucide-react";

interface AgenceLayoutProps {
  children: React.ReactNode;
  agenceNom?: string;
  agenceId?: string;
  alertesNonLues?: number;
}

const NAV_ITEMS = [
  {
    label: "Tableau de bord",
    href: "/agence",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: "Inventaire",
    href: "/agence/inventaire",
    icon: PackageSearch,
  },
  {
    label: "Prévisions",
    href: "/agence/previsions",
    icon: TrendingUp,
  },
  {
    label: "Transferts",
    href: "/agence/transferts",
    icon: ArrowRightLeft,
  },
];

export default function AgenceLayout({
  children,
  agenceNom = "Agence Alger Centre",
  agenceId = "AG-001",
  alertesNonLues = 3,
}: AgenceLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* ── Barre de démonstration ── */}
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-1.5 text-center">
        <span className="text-xs font-medium text-amber-700">
          ⚠ Données de démonstration — simulées · Prototype VMS Nexus Ideathon 2026
        </span>
      </div>

      {/* ── En-tête principal ── */}
      <header className="bg-navy-900 bg-[#0f1f3d] text-white border-b border-[#1a2f52] shadow-md sticky top-0 z-40">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          {/* Logo & Titre */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center">
              <Gauge className="w-4 h-4 text-white" />
            </div>
            <div className="leading-tight">
              <span className="font-bold text-white text-base tracking-tight">
                VMS <span className="text-teal-400">Nexus</span>
              </span>
              <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                Gestion des Stocks
              </div>
            </div>
          </div>

          {/* Nav principale */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href) && !pathname.endsWith("/agence");
              const activeFix =
                item.href === "/agence"
                  ? pathname === "/agence" || pathname === "/agence/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    activeFix
                      ? "bg-teal-500/20 text-teal-300 border border-teal-500/30"
                      : "text-slate-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <item.icon className="w-3.5 h-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Droite : alertes + profil */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <Link
              href="/agence/alertes"
              className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
            >
              <Bell className="w-4 h-4" />
              {alertesNonLues > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 ring-2 ring-[#0f1f3d]" />
              )}
            </Link>

            {/* Profil */}
            <div className="flex items-center gap-2 pl-2 border-l border-white/10">
              <div className="w-7 h-7 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold text-xs">
                K
              </div>
              <div className="hidden sm:block leading-tight">
                <div className="text-xs font-semibold text-white">{agenceNom}</div>
                <div className="text-[10px] text-slate-400">{agenceId} · Rôle : Agence</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>

            <Link
              href="/"
              title="Se déconnecter"
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition"
            >
              <LogOut className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Contenu ── */}
      <main className="flex-1">{children}</main>

      {/* ── Pied de page ── */}
      <footer className="border-t border-slate-200 bg-white px-6 py-3 text-center text-xs text-slate-400">
        VMS Nexus · Prototype Hackathon 2026 · Données simulées à des fins de démonstration
      </footer>
    </div>
  );
}
