"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  PackageSearch,
  ArrowRightLeft,
  TrendingUp,
  Wrench,
  ShieldCheck,
  Bell,
  LogOut,
  ChevronDown,
  Gauge,
  ShieldAlert,
  AlertTriangle,
  Info,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export type AgenceTabId =
  | "dashboard"
  | "inventaire"
  | "previsions"
  | "transferts"
  | "pieces"
  | "securite";

interface AgenceLayoutProps {
  children: React.ReactNode;
  activeTab: AgenceTabId;
  onTabChange: (tab: AgenceTabId) => void;
  alertesNonLues?: number;
  onOpenAlerts?: () => void;
  onSimulateUnauthorized?: () => void;
}

export default function AgenceLayout({
  children,
  activeTab,
  onTabChange,
  alertesNonLues = 3,
  onOpenAlerts,
  onSimulateUnauthorized,
}: AgenceLayoutProps) {
  const router = useRouter();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const NAV_ITEMS: { id: AgenceTabId; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: "dashboard", label: "Tableau de Bord", icon: LayoutDashboard },
    { id: "inventaire", label: "Inventaire & Stock", icon: PackageSearch },
    { id: "previsions", label: "Prévisions & Demande", icon: TrendingUp },
    { id: "transferts", label: "Transferts & Réappro", icon: ArrowRightLeft },
    { id: "pieces", label: "Pièces de Rechange", icon: Wrench },
    { id: "securite", label: "Périmètre & Sécurité", icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      {/* ── Bandeau Réglementaire Démo (Conforme §3 AGENTS.md) ── */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-1.5 text-center text-xs text-amber-900 flex items-center justify-center gap-2">
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-white uppercase tracking-wider">
          Données simulées
        </span>
        <span className="font-medium">
          Démonstration Prototype VMS SMART — Hackathon 2026 — Données synthétiques d&apos;activité VMS Industrie
        </span>
      </div>

      {/* ── En-tête Principal (Deep Navy #0f1f3d) ── */}
      <header className="bg-[#0f1f3d] text-white border-b border-[#1b315b] shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo & Titre de l'application */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="h-10 w-10 rounded-xl bg-white/95 flex items-center justify-center p-1 shadow-md shadow-black/20">
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
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-lg tracking-tight">
                  VMS <span className="text-teal-400">SMART</span>
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30 uppercase">
                  Espace Agence
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-medium">
                Anticipation de la demande & gestion intelligente des stocks
              </div>
            </div>
          </div>

          {/* Navigation par Onglets Principaux */}
          <nav className="hidden lg:flex items-center gap-1 bg-[#0b172e] p-1 rounded-xl border border-white/5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? "bg-teal-500 text-white shadow-md shadow-teal-500/20"
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Actions Droite : Alertes, Rôle, Déconnexion */}
          <div className="flex items-center gap-2.5">
            {/* Bouton Test Scénario Sécurité 2 (AGENTS.md §10) */}
            <button
              onClick={onSimulateUnauthorized}
              title="Tester une tentative d'accès non autorisé à une autre UP"
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 transition cursor-pointer"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
              <span>Test RBAC</span>
            </button>

            {/* Bouton Alertes */}
            <button
              onClick={onOpenAlerts}
              title="Consulter les alertes stock"
              className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              <Bell className="w-5 h-5" />
              {alertesNonLues > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-[#0f1f3d]">
                  {alertesNonLues}
                </span>
              )}
            </button>

            {/* Profil Agence */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl hover:bg-white/10 border border-white/10 transition cursor-pointer text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  AG
                </div>
                <div className="hidden sm:block leading-tight">
                  <div className="text-xs font-bold text-white">Agence Alger Centre</div>
                  <div className="text-[10px] text-slate-400">Rattachée : UP Centre (#AG-001)</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Menu Profil Popover */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50 text-xs text-slate-700">
                  <div className="px-3.5 py-2.5 border-b border-slate-100">
                    <div className="font-bold text-slate-900">Karim Benali</div>
                    <div className="text-[11px] font-mono text-slate-500">karim.benali@agence.com</div>
                    <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                      Rôle 1 : Agence (Concessionnaire)
                    </div>
                  </div>

                  <div className="px-3.5 py-2 text-[11px] text-slate-500 space-y-1">
                    <div><strong>Zone :</strong> Wilaya d&apos;Alger</div>
                    <div><strong>Unité de tutelle :</strong> UP Centre (Blida/Alger)</div>
                    <div><strong>Agences sœurs :</strong> Blida, Tipaza</div>
                  </div>

                  <div className="border-t border-slate-100 pt-1 mt-1">
                    <button
                      onClick={() => router.push("/")}
                      className="w-full text-left px-3.5 py-2 text-red-600 hover:bg-red-50 flex items-center gap-2 transition cursor-pointer font-medium"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Changer de rôle / Déconnexion</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Barre de navigation mobile / petits écrans */}
        <div className="lg:hidden border-t border-white/10 px-4 py-2 flex items-center gap-2 overflow-x-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? "bg-teal-500 text-white"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* ── Contenu Principal ── */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {children}
      </main>

      {/* ── Pied de page ── */}
      <footer className="border-t border-slate-200 bg-white px-6 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            VMS SMART &bull; Défi Hackathon VMS Industrie 2026 &bull; Architecture réseau 3 tiers sécurisée
          </span>
          <span className="font-mono text-[11px] text-slate-400">
            Sources publiques motos : autobip.com &bull; motobladi.dz
          </span>
        </div>
      </footer>
    </div>
  );
}
