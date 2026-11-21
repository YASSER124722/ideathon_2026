"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Compass,
  TrendingUp,
  Building2,
  Factory,
  Warehouse,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  FileCheck,
  Award,
  Layers,
  PieChart,
  BarChart3,
  DollarSign,
  Download,
  Users,
  Lock,
  Network,
  RotateCcw,
  Sparkles,
  Search,
  Filter,
  Check,
  X,
  ChevronRight,
  LogOut,
  Info,
  Server,
  Key,
  Shield,
  Activity,
  ArrowRightLeft,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import {
  PRODUITS,
  UNITES_PRODUCTION,
  AGENCES,
  TRANSFERTS,
  ANNUAIRE_UTILISATEURS,
  AUDIT_SECURITE_INITIAL,
  PREVISIONS_PAR_MODELE,
} from "@/lib/data";
import type {
  DemandeTransfert,
  AuditSecurityEvent,
  UserAccessRecord,
} from "@/lib/types";

type DirectionTabId = "dashboard" | "regions" | "approbations" | "securite" | "utilisateurs" | "sources";

export default function DirectionPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<DirectionTabId>("dashboard");

  // Données interactives
  const [transferts, setTransferts] = useState<DemandeTransfert[]>(TRANSFERTS);
  const [utilisateurs, setUtilisateurs] = useState<UserAccessRecord[]>(ANNUAIRE_UTILISATEURS);
  const [auditLogs, setAuditLogs] = useState<AuditSecurityEvent[]>(AUDIT_SECURITE_INITIAL);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filtre utilisateur
  const [searchUser, setSearchUser] = useState("");
  const [selectedHorizon, setSelectedHorizon] = useState<7 | 30 | 90>(30);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3800);
  };

  // Action : Approbation par la Direction d'un transfert inter-UP (§6.E & §10)
  const handleApproveInterUP = (id: string) => {
    const tr = transferts.find((t) => t.id === id);
    if (!tr) return;

    setTransferts((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              statut: "approuvé",
              dateMiseAJour: "À l'instant",
              approuvePar: "Dr. Amina Cherif (Direction Générale)",
              notes: "Approuvé par décision exécutive centrale. Ordre de transport inter-régional émis.",
            }
          : t
      )
    );

    const newLog: AuditSecurityEvent = {
      id: `DIR-AUD-${auditLogs.length + 15}`,
      timestamp: new Date().toLocaleTimeString("fr-FR"),
      userEmail: "directeur@direction.com",
      userRole: "Direction",
      agenceId: "Direction Centrale (Alger)",
      action: "EXECUTIVE_TRANSFER_APPROVED",
      ressource: `/transfers/${id}`,
      statut: "autorise",
      details: `Validation centrale du transfert inter-unités de ${tr.quantite} unités. Autorisation accordée.`,
    };
    setAuditLogs([newLog, ...auditLogs]);

    showToast(`✓ Décision enregistrée : Transfert ${id} validé par la Direction Générale !`);
  };

  // Bascule statut utilisateur (Actif / Suspendu)
  const handleToggleUserStatus = (userId: string) => {
    setUtilisateurs((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const nvStatut = u.statut === "Actif" ? "Suspendu" : "Actif";
          showToast(`Compte de ${u.nom} passé en statut : ${nvStatut}`);
          return { ...u, statut: nvStatut };
        }
        return u;
      })
    );
  };

  // Réinitialisation démo
  const handleResetDemoData = () => {
    setTransferts(TRANSFERTS);
    setAuditLogs(AUDIT_SECURITE_INITIAL);
    showToast("Données de démonstration réinitialisées avec succès !");
  };

  // Données comparatives des 3 régions
  const regionalComparisonData = [
    { region: "UP Centre", stock: 142, demande: 79, agences: 3, alertes: 2 },
    { region: "UP Est", stock: 98, demande: 65, agences: 2, alertes: 1 },
    { region: "UP Ouest", stock: 115, demande: 58, agences: 2, alertes: 0 },
  ];

  const nationalChartData = PREVISIONS_PAR_MODELE["national_vms"];

  return (
    <div className="min-h-screen bg-[#F4F6F9] flex flex-col font-sans text-slate-800">
      {/* Toast Flottant */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-slideUp text-xs font-medium max-w-md">
          <CheckCircle2 className="w-4 h-4 text-[#D90016] shrink-0" />
          <span className="flex-1">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Bandeau Prototype Démo */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-1.5 text-center text-xs text-amber-900 flex items-center justify-center gap-2">
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-white uppercase tracking-wider">
          Données simulées
        </span>
        <span className="font-medium">
          Démonstration Prototype VMS SMART — Espace Direction Générale & Administration Centrale
        </span>
      </div>

      {/* En-tête Direction */}
      <header className="bg-[#101828] text-white border-b border-[#1e293b] shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <div className="h-10 w-10 rounded-xl bg-white/95 flex items-center justify-center p-1 shadow-md shadow-black/20">
              <Image src="/image.png" alt="Logo VMS SMART" width={36} height={36} className="h-8 w-auto object-contain" priority />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-lg tracking-tight">
                  VMS <span className="text-[#D90016]">SMART</span>
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#D90016]/15 text-[#D90016] border border-[#D90016]/30 uppercase">
                  Direction Générale
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-medium">
                Gouvernance nationale &bull; Supervision transversale &bull; Sécurité
              </div>
            </div>
          </div>

          {/* Navigation Onglets */}
          <nav className="hidden lg:flex items-center gap-1 bg-[#0c1322] p-1 rounded-xl border border-white/5">
            {[
              { id: "dashboard", label: "Vue Nationale", icon: Compass },
              { id: "regions", label: "Comparatif Unités", icon: Factory },
              { id: "approbations", label: "Arbitrages Direction", icon: ArrowRightLeft },
              { id: "securite", label: "Architecture Cyber", icon: Network },
              { id: "utilisateurs", label: "Utilisateurs & Rôles", icon: Users },
              { id: "sources", label: "Sources & Démo", icon: Info },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as DirectionTabId)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#D90016] text-white font-bold shadow-sm shadow-[#D90016]/20"
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Sélecteur Rapide de Rôles pour Démo Facile */}
          <div className="hidden xl:flex items-center bg-[#0c1322] border border-white/10 rounded-xl p-1 text-[11px] gap-1">
            <span className="text-[10px] text-slate-400 px-2 font-medium">Vue :</span>
            <button
              onClick={() => router.push("/agence")}
              className="px-2.5 py-1 rounded-lg font-medium text-slate-300 hover:text-white hover:bg-white/10 transition"
            >
              1. Agence
            </button>
            <button
              onClick={() => router.push("/unit_p")}
              className="px-2.5 py-1 rounded-lg font-medium text-slate-300 hover:text-white hover:bg-white/10 transition"
            >
              2. Unité Prod.
            </button>
            <button
              onClick={() => router.push("/direction")}
              className="px-2.5 py-1 rounded-lg font-bold bg-[#D90016] text-white transition shadow-xs"
            >
              3. Direction
            </button>
          </div>
          {/* Profil */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right leading-tight">
              <div className="text-xs font-bold text-white">Dr. Amina Cherif</div>
              <div className="text-[10px] text-slate-400">Directrice Générale &bull; Siège VMS</div>
            </div>
            <Link
              href="/"
              title="Changer de rôle / Déconnexion"
              className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition"
            >
              <LogOut className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Contenu Principal */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* ── GUIDE RAPIDE MODE D'EMPLOI DIRECTION ── */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-red-50 text-[#D90016] shrink-0 mt-0.5">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-slate-900">
                    Comment piloter au niveau national ? &bull; Scénario Démo Direction Générale
                  </h2>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#D90016]/10 text-[#D90016] uppercase">
                    Rôle 3 : Gouvernance Centrale
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  La Direction Générale consolide la vision d&apos;ensemble des 3 Unités de Production, arbitre les transferts stratégiques inter-unités et audite la sécurité cyber.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 flex items-center gap-1.5 font-medium">
                <span className="w-5 h-5 rounded-full bg-[#D90016] text-white text-[10px] font-bold flex items-center justify-center">1</span>
                <span>Superviser courbe nationale</span>
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 flex items-center gap-1.5 font-medium">
                <span className="w-5 h-5 rounded-full bg-[#27364B] text-white text-[10px] font-bold flex items-center justify-center">2</span>
                <span>Signer transferts inter-UP</span>
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 flex items-center gap-1.5 font-medium">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">3</span>
                <span>Contrôler cloisonnement RBAC</span>
              </span>
            </div>
          </div>
        </div>

        {/* Titre & Résumé */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-lg bg-[#D90016]/10 text-[#D90016] border border-[#D90016]/20 text-xs font-bold font-mono">
                  DIRECTION NATIONALE
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Supervision Réseau VMS Algérie (3 Unités de Production &bull; 80+ Concessions)
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
                Console Exécutive Centrale &bull; Direction Générale
              </h1>
              <p className="text-xs text-slate-500">
                Arbitrage des transferts stratégiques, comparaison régionale des stocks et monitoring de la sécurité
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => showToast("Exportation de la synthèse exécutive trimestrielle VMS SMART...")}
                className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Rapport Exécutif PDF</span>
              </button>
              <button
                onClick={handleResetDemoData}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#D90016]" />
                <span>Réinitialiser Démo</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4 KPIs Exécutifs Consolidés (§6.B AGENTS.md) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            onClick={() => setActiveTab("regions")}
            className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs cursor-pointer hover:border-[#D90016] transition"
          >
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>Stock National Total</span>
              <span className="p-2 bg-red-50 rounded-xl text-[#D90016]">
                <Warehouse className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">455</span>
              <span className="text-xs text-slate-500">unités</span>
            </div>
            <div className="mt-2 text-[11px] text-[#D90016] font-medium">
              355 en entrepôts UP &bull; 100 en agences
            </div>
          </div>

          <div
            onClick={() => setActiveTab("dashboard")}
            className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs cursor-pointer hover:border-blue-400 transition"
          >
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>Demande Nationale 30j</span>
              <span className="p-2 bg-blue-50 rounded-xl text-blue-600">
                <TrendingUp className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">218</span>
              <span className="text-xs text-emerald-600 font-bold flex items-center">
                <ArrowUpRight className="w-3 h-3" /> +14.2%
              </span>
            </div>
            <div className="mt-2 text-[11px] text-slate-500">
              Couverture de stock nationale : 2.1 mois
            </div>
          </div>

          <div
            onClick={() => setActiveTab("regions")}
            className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs cursor-pointer hover:border-red-400 transition"
          >
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>Ruptures & Excédents</span>
              <span className="p-2 bg-amber-50 rounded-xl text-amber-600">
                <AlertTriangle className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-red-600">3</span>
              <span className="text-xs text-[#D90016] font-bold">ruptures / 4 excédents</span>
            </div>
            <div className="mt-2 text-[11px] text-amber-700 font-medium">
              Potentiel d&apos;équilibrage par transfert élevé
            </div>
          </div>

          <div
            onClick={() => setActiveTab("securite")}
            className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs cursor-pointer hover:border-purple-400 transition"
          >
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>Sécurité & Cloisonnement</span>
              <span className="p-2 bg-purple-50 rounded-xl text-purple-600">
                <ShieldCheck className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">100%</span>
              <span className="text-xs text-slate-500">étanche</span>
            </div>
            <div className="mt-2 text-[11px] text-purple-700 font-medium">
              Segmentation réseau 3 tiers active
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* TAB 1 : VUE NATIONALE (§6.B)                                        */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Graphique National Consolidé */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-[#D90016]" />
                      Évolution Nationale des Ventes & Prévisions VMS SMART
                    </h2>
                    <p className="text-xs text-slate-500">
                      Consolidation des 3 Unités de Production et de leurs réseaux de concessionnaires
                    </p>
                  </div>
                </div>

                <div className="h-64 w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={nationalChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                      <defs>
                        <linearGradient id="dirVentes" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#D90016" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#D90016" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="dirPrev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="mois" tick={{ fontSize: 11, fill: "#64748b" }} />
                      <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                      <Tooltip contentStyle={{ fontSize: 12, borderRadius: 12 }} />
                      <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                      <Area type="monotone" dataKey="ventes" name="Ventes Nationales Réelles" stroke="#D90016" strokeWidth={2.5} fill="url(#dirVentes)" />
                      <Area type="monotone" dataKey="prevision" name="Projection Nationale (WMA)" stroke="#3b82f6" strokeWidth={2.5} strokeDasharray="4 4" fill="url(#dirPrev)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Répartition Régionale du Stock */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
                    <BarChart3 className="w-4 h-4 text-blue-600" />
                    Répartition par Unité de Production
                  </h2>

                  <div className="space-y-4 mt-4">
                    {regionalComparisonData.map((reg) => (
                      <div key={reg.region} className="space-y-1 text-xs">
                        <div className="flex justify-between font-semibold">
                          <span className="text-slate-800">{reg.region}</span>
                          <span className="text-slate-900 font-bold">{reg.stock} motos ({reg.agences} agences)</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-[#D90016] h-full rounded-full"
                            style={{ width: `${Math.round((reg.stock / 200) * 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[11px] text-slate-400">
                          <span>Demande 30j : ~{reg.demande} u.</span>
                          <span className={reg.alertes > 0 ? "text-amber-600 font-bold" : "text-emerald-600 font-semibold"}>
                            {reg.alertes > 0 ? `${reg.alertes} alertes stock` : "Équilibré"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
                  Total national : <strong>455 unités</strong> sous gestion centralisée.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* TAB 2 : COMPARATIF DES UNITÉS DE PRODUCTION (§6.F)                 */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {activeTab === "regions" && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Factory className="w-4 h-4 text-[#D90016]" />
                  Comparatif Consolidé des 3 Unités de Production VMS
                </h2>
                <p className="text-xs text-slate-500">
                  Supervision des capacités d&apos;entrepôt, demande agrégée et santé des clusters régionaux
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-100 font-semibold">
                  <tr>
                    <th className="px-4 py-3">Unité de Production</th>
                    <th className="px-4 py-3">Région Couverte</th>
                    <th className="px-3 py-3 text-right">Capacité Entrepôt</th>
                    <th className="px-3 py-3 text-right">Stock Actuel</th>
                    <th className="px-3 py-3 text-right">Taux Saturation</th>
                    <th className="px-3 py-3 text-center">Agences Rattachées</th>
                    <th className="px-4 py-3 text-right">Responsable Régional</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {UNITES_PRODUCTION.map((u) => {
                    const ratio = Math.round((u.stockEntrepotActuel / u.capaciteEntrepot) * 100);
                    return (
                      <tr key={u.id} className="hover:bg-slate-50/70 transition">
                        <td className="px-4 py-3.5 font-bold text-slate-900 text-xs">
                          {u.nom}
                        </td>
                        <td className="px-4 py-3.5 text-slate-600">{u.region}</td>
                        <td className="px-3 py-3.5 text-right text-slate-600 font-mono">
                          {u.capaciteEntrepot} u.
                        </td>
                        <td className="px-3 py-3.5 text-right font-extrabold text-slate-900 text-sm">
                          {u.stockEntrepotActuel} u.
                        </td>
                        <td className="px-3 py-3.5 text-right">
                          <span className="font-bold text-[#D90016] bg-red-50 px-2 py-0.5 rounded text-[11px]">
                            {ratio}%
                          </span>
                        </td>
                        <td className="px-3 py-3.5 text-center font-bold text-slate-800">
                          {u.agences.length} agences
                        </td>
                        <td className="px-4 py-3.5 text-right font-medium text-slate-700">
                          {u.responsable}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* TAB 3 : ARBITRAGES DIRECTION & VALIDATIONS (§4.3 étape 3 & §6.E)    */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {activeTab === "approbations" && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ArrowRightLeft className="w-4 h-4 text-[#D90016]" />
                  Arbitrages Exécutifs : Transferts Stratégiques Inter-Unités
                </h2>
                <p className="text-xs text-slate-500">
                  Actions de haut niveau nécessitant la signature de la Direction Centrale (§4.3 règle 3)
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {transferts
                .filter((t) => t.typeTransfert === "inter_up" || t.statut === "en_attente_approbation")
                .map((tr) => {
                  const p = PRODUITS.find((pr) => pr.id === tr.produitId);
                  const isApproved = tr.statut === "approuvé";

                  return (
                    <div key={tr.id} className="py-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-900">{tr.id}</span>
                          <span className="text-slate-400">&bull;</span>
                          <span className="font-bold text-xs text-[#D90016]">
                            {p?.modele} ({tr.quantite} unités)
                          </span>
                          <span className="text-slate-400">&bull;</span>
                          <span className="text-[11px] text-slate-500">
                            Transfert Inter-Unités : UP Centre &rarr; UP Est
                          </span>
                        </div>

                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isApproved
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-amber-100 text-amber-900"
                          }`}
                        >
                          {isApproved ? "Validé par Direction" : "En attente Signature Direction"}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 leading-relaxed">
                        {tr.raisonRecommandation}
                      </p>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] text-slate-400">
                          {tr.approuvePar ? `Signé par : ${tr.approuvePar}` : "Validation requise"}
                        </span>

                        {!isApproved && (
                          <button
                            onClick={() => handleApproveInterUP(tr.id)}
                            className="px-3.5 py-1.5 rounded-lg bg-[#D90016] hover:bg-[#b80013] text-white font-bold text-xs flex items-center gap-1 shadow-xs cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Signer & Approuver le Transfert</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* TAB 4 : ARCHITECTURE CYBER & SÉCURITÉ (§5 & §6.G AGENTS.md)         */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {activeTab === "securite" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Network className="w-4 h-4 text-[#D90016]" />
                    Architecture Cyber & Cloisonnement Réseau (§5 AGENTS.md)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Modèle conceptuel de segmentation par VM / UP et barrières pare-feu étanches
                  </p>
                </div>
              </div>

              {/* Schéma de Topologie Réseau (§5 AGENTS.md) */}
              <div className="my-5 p-5 rounded-2xl bg-slate-950 text-white border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#D90016]">
                    [TOPOLOGIE RÉSEAU SÉCURISÉE VMS SMART]
                  </span>
                  <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                    PARE-FEUX ACTIFS &bull; CHIFFREMENT TLS
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
                  {/* Noeud Direction */}
                  <div className="md:col-span-3 p-3.5 rounded-xl bg-slate-900 border border-[#D90016]/40 text-center space-y-1">
                    <div className="font-bold text-[#D90016] text-sm">
                      🏛️ DIRECTION GÉNÉRALE & SERVICES CENTRAUX
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Réseau Central Isolé &bull; Base de Données d&apos;Audit Immuable &bull; Contrôle d&apos;Accès RBAC
                    </div>
                  </div>

                  {/* Noeud UP Centre */}
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-teal-500/30 space-y-2">
                    <div className="font-bold text-teal-300">VM 1 : UP CENTRE</div>
                    <div className="text-[11px] text-slate-400">
                      Entrepôt Rouïba/Blida<br />
                      Agences : Alger, Blida, Tipaza
                    </div>
                    <div className="text-[10px] text-[#D90016] pt-1 border-t border-slate-800">
                      &bull; Passerelle Filtrée vers Direction
                    </div>
                  </div>

                  {/* Noeud UP Est */}
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-teal-500/30 space-y-2">
                    <div className="font-bold text-teal-300">VM 2 : UP EST</div>
                    <div className="text-[11px] text-slate-400">
                      Entrepôt Constantine<br />
                      Agences : Constantine, Annaba
                    </div>
                    <div className="text-[10px] text-[#D90016] pt-1 border-t border-slate-800">
                      &bull; Passerelle Filtrée vers Direction
                    </div>
                  </div>

                  {/* Noeud UP Ouest */}
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-teal-500/30 space-y-2">
                    <div className="font-bold text-teal-300">VM 3 : UP OUEST</div>
                    <div className="text-[11px] text-slate-400">
                      Entrepôt Oran<br />
                      Agences : Oran, Tlemcen
                    </div>
                    <div className="text-[10px] text-[#D90016] pt-1 border-t border-slate-800">
                      &bull; Passerelle Filtrée vers Direction
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800 text-center">
                  Protection contre le mouvement latéral : une agence d&apos;une UP ne peut en aucun cas interroger l&apos;entrepôt d&apos;une autre UP directement sans autorisation centrale.
                </div>
              </div>

              {/* Journal d'Audit Central */}
              <div>
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Journal d&apos;Audit & Événements de Sécurité Centralisé (Immuable)
                </h3>
                <div className="divide-y divide-slate-100 border border-slate-200/70 rounded-xl overflow-hidden text-xs">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="p-3.5 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-800">{log.id}</span>
                          <span className="text-slate-400">&bull;</span>
                          <span className="text-slate-500">{log.timestamp}</span>
                          <span className="text-slate-400">&bull;</span>
                          <span className="font-mono text-[#D90016] font-semibold">{log.action}</span>
                        </div>
                        <p className="text-slate-600 mt-1 leading-relaxed">{log.details}</p>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                        {log.statut === "autorise" ? "Autorisé" : "Bloqué 403"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* TAB 5 : ANNUAIRE UTILISATEURS & ACCÈS (§6.H AGENTS.md)              */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {activeTab === "utilisateurs" && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#D90016]" />
                  Annuaire des Rôles & Gestion des Accès VMS SMART (§2 & §6.H)
                </h2>
                <p className="text-xs text-slate-500">
                  Contrôle des 3 rôles officiels de l&apos;application : Agence, Unité de Production, Direction
                </p>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Rechercher utilisateur..."
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D90016]"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-100 font-semibold">
                  <tr>
                    <th className="px-4 py-3">Utilisateur / Nom</th>
                    <th className="px-4 py-3">Adresse Email</th>
                    <th className="px-3 py-3">Rôle VMS</th>
                    <th className="px-4 py-3">Périmètre Autorisé</th>
                    <th className="px-3 py-3 text-center">Statut</th>
                    <th className="px-4 py-3 text-right">Action Direction</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {utilisateurs
                    .filter((u) => u.nom.toLowerCase().includes(searchUser.toLowerCase()) || u.email.toLowerCase().includes(searchUser.toLowerCase()))
                    .map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50/70 transition">
                        <td className="px-4 py-3.5 font-bold text-slate-900 text-xs">{user.nom}</td>
                        <td className="px-4 py-3.5 font-mono text-slate-600">{user.email}</td>
                        <td className="px-3 py-3.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              user.role === "Direction"
                                ? "bg-emerald-100 text-emerald-900"
                                : user.role === "Unité de production"
                                ? "bg-amber-100 text-amber-900"
                                : "bg-blue-100 text-blue-900"
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-slate-600 text-[11px]">{user.perimetre}</td>
                        <td className="px-3 py-3.5 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              user.statut === "Actif" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"
                            }`}
                          >
                            {user.statut}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <button
                            onClick={() => handleToggleUserStatus(user.id)}
                            className="text-xs font-semibold text-slate-600 hover:text-red-600 transition"
                          >
                            {user.statut === "Actif" ? "Suspendre" : "Réactiver"}
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* TAB 6 : SOURCES & DONNÉES DE RÉFÉRENCE (§3 & §6.H AGENTS.md)       */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {activeTab === "sources" && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4 text-xs text-slate-700 leading-relaxed">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
              <Info className="w-5 h-5 text-emerald-600" />
              Politique des Données & Attribution des Sources (§3 AGENTS.md)
            </h2>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <h3 className="font-bold text-slate-900 text-sm">Données du Catalogue Public</h3>
              <p>
                Conformément aux instructions d&apos;AGENTS.md, aucune donnée interne confidentielle de VMS Industrie n&apos;est exploitée.
                Les caractéristiques des motos et prix publics de référence proviennent des sources publiques suivantes :
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-600">
                <li>
                  <a href="https://www.autobip.com/ar/prix-vms-algerie/81" target="_blank" rel="noopener noreferrer" className="text-[#D90016] font-semibold hover:underline">
                    autobip.com/ar/prix-vms-algerie/81
                  </a> &bull; Relevé Janvier 2026.
                </li>
                <li>
                  <a href="https://motobladi.dz/product-brand/vms/" target="_blank" rel="noopener noreferrer" className="text-[#D90016] font-semibold hover:underline">
                    motobladi.dz/product-brand/vms/
                  </a> &bull; Relevé Janvier 2026.
                </li>
              </ul>
              <p className="text-[11px] text-slate-500 italic mt-2">
                Les prix mentionnés sont donnés à titre indicatif de référence publique et ne préjugent pas des tarifs réels des concessions.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1 text-amber-900">
              <h3 className="font-bold text-amber-950 text-sm">Données Commerciales Synthétiques & Simulées</h3>
              <p>
                Tous les volumes de stock, historiques de vente, prévisions de demande, assignations d&apos;agences et ordres de fabrication
                sont générés de manière synthétique pour démontrer les capacités de l&apos;application VMS SMART devant le jury du Hackathon 2026.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Pied de page */}
      <footer className="border-t border-slate-200 bg-white px-6 py-4 text-center text-xs text-slate-500">
        VMS SMART &bull; Espace Direction Générale &bull; Défi Hackathon VMS Industrie 2026
      </footer>
    </div>
  );
}
