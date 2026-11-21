"use client";

import React, { useState } from "react";
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
  ShieldAlert,
  ChevronRight,
  Menu,
  X,
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const NAV_ITEMS: { id: AgenceTabId; label: string; icon: React.ElementType }[] = [
    { id: "dashboard", label: "Tableau de Bord", icon: LayoutDashboard },
    { id: "inventaire", label: "Inventaire & Stock", icon: PackageSearch },
    { id: "previsions", label: "Prévisions & Demande", icon: TrendingUp },
    { id: "transferts", label: "Transferts & Réappro", icon: ArrowRightLeft },
    { id: "pieces", label: "Pièces de Rechange", icon: Wrench },
    { id: "securite", label: "Périmètre & Sécurité", icon: ShieldCheck },
  ];

  const currentTabLabel = NAV_ITEMS.find((n) => n.id === activeTab)?.label || "Tableau de Bord";

  return (
    <div className="min-h-screen bg-[#F4F6F9] flex font-sans text-slate-800">
      {/* ── SIDEBAR VERTICALE (Dark Navy #101828) ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#101828] text-white flex flex-col justify-between border-r border-[#1e293b] transition-transform duration-200 lg:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          {/* Logo & Titre */}
          <div className="p-5 flex items-center justify-between border-b border-[#1e293b]">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center p-1 shadow-sm">
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
                <div className="font-extrabold text-white text-base tracking-tight leading-none">
                  VMS <span className="text-[#D90016]">SMART</span>
                </div>
                <div className="mt-1 inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#D90016]/15 text-[#D90016] border border-[#D90016]/30 uppercase">
                  Agence &bull; Alger
                </div>
              </div>
            </div>

            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Verticale */}
          <nav className="p-3 space-y-1">
            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Menu Principal
            </div>
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    isActive
                      ? "bg-[#D90016] text-white shadow-sm shadow-[#D90016]/30"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/70" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Profil & Déconnexion en bas de Sidebar */}
        <div className="p-3 border-t border-[#1e293b]">
          <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#D90016] text-white flex items-center justify-center font-bold text-xs shrink-0">
                AG
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">Karim Benali</div>
                <div className="text-[10px] text-slate-400 truncate font-mono">karim.benali@agence.com</div>
              </div>
            </div>

            <button
              onClick={() => router.push("/")}
              title="Déconnexion"
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── ZONE DE CONTENU PRINCIPALE (À DROITE DE LA SIDEBAR) ── */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Bandeau Supérieur Épuré */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-slate-200/80 px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="font-extrabold text-sm text-slate-900">{currentTabLabel}</span>
            <span className="text-slate-300">/</span>
            <span className="text-xs font-mono text-slate-500">Agence #AG-001 (Alger)</span>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-900 border border-amber-500/25 uppercase">
              Données simulées
            </span>

            {/* Test Sécurité RBAC */}
            <button
              onClick={onSimulateUnauthorized}
              title="Tester RBAC"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-[#D90016] border border-red-200 hover:bg-red-100 transition cursor-pointer"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Test RBAC</span>
            </button>

            {/* Notifications Alertes */}
            <button
              onClick={onOpenAlerts}
              title="Alertes"
              className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              {alertesNonLues > 0 && (
                <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full bg-[#D90016] text-white text-[9px] font-bold flex items-center justify-center">
                  {alertesNonLues}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Contenu de la vue */}
        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
          {children}
        </main>

        <footer className="border-t border-slate-200/80 bg-white px-6 py-3 text-center text-[11px] text-slate-400">
          VMS SMART &bull; Prototype Hackathon VMS Industrie 2026 &bull; Données de référence : autobip.com, motobladi.dz
        </footer>
      </div>
    </div>
  );
}
