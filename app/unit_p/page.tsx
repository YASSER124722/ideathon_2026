"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Factory,
  Warehouse,
  Package,
  ArrowRightLeft,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Truck,
  Plus,
  Search,
  Filter,
  Check,
  X,
  ChevronRight,
  ShieldAlert,
  ShieldCheck,
  Send,
  Boxes,
  Users,
  Sparkles,
  RefreshCw,
  LogOut,
  Info,
  Calendar,
  Layers,
  Activity,
  ArrowUpRight,
  ChevronDown, Menu,
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
  WAREHOUSE_STOCKS_UP_CENTRE,
  STOCKS_AG001,
  STOCKS_AG002,
  STOCKS_AG003,
  TRANSFERTS,
  ORDRES_FABRICATION,
  PREVISIONS_PAR_MODELE,
  AUDIT_SECURITE_INITIAL,
} from "@/lib/data";
import type {
  WarehouseStockRecord,
  DemandeTransfert,
  ProductionOrder,
  AuditSecurityEvent,
  StockRecord,
} from "@/lib/types";

type UPTabId = "dashboard" | "warehouse" | "agences" | "approbations" | "fabrication" | "audit";

export default function UniteDeProductionPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<UPTabId>("dashboard");

  // États interactifs
  const [warehouseStocks, setWarehouseStocks] = useState<WarehouseStockRecord[]>(WAREHOUSE_STOCKS_UP_CENTRE);
  const [transferts, setTransferts] = useState<DemandeTransfert[]>(TRANSFERTS);
  const [ordresFabrication, setOrdresFabrication] = useState<ProductionOrder[]>(ORDRES_FABRICATION);
  const [auditLogs, setAuditLogs] = useState<AuditSecurityEvent[]>(AUDIT_SECURITE_INITIAL);

  // Notifications toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [showNewOFModal, setShowNewOFModal] = useState(false);
  const [showInterUPModal, setShowInterUPModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Formulaire Nouvel Ordre de Fabrication (OF)
  const [ofModelId, setOfModelId] = useState("vms-cirta-125");
  const [ofQuantity, setOfQuantity] = useState(40);
  const [ofPriority, setOfPriority] = useState<"Haute" | "Normale">("Haute");

  // Formulaire Transfert Inter-UP
  const [interUPModelId, setInterUPModelId] = useState("vms-clio-125");
  const [interUPDestUnit, setInterUPDestUnit] = useState("up-est");
  const [interUPQuantity, setInterUPQuantity] = useState(10);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3800);
  };

  // KPIs
  const totalStockWarehouse = warehouseStocks.reduce((a, s) => a + s.quantiteDisponible, 0);
  const totalStockReserve = warehouseStocks.reduce((a, s) => a + s.quantiteReservee, 0);
  const transfertsEnAttente = transferts.filter((t) => t.statut === "en_attente_approbation");
  const ofActifs = ordresFabrication.filter((o) => o.statut === "En cours" || o.statut === "Planifié");

  // ACTION CLÉ DU HACKATHON (§10 Scénario 1 Étape 4) :
  // Le chef d'UP examine et APPROUVE le transfert d'une agence en excédent vers une agence en rupture !
  const handleApproveTransfer = (transfertId: string) => {
    const tr = transferts.find((t) => t.id === transfertId);
    if (!tr) return;

    setTransferts((prev) =>
      prev.map((t) =>
        t.id === transfertId
          ? {
              ...t,
              statut: "approuvé",
              dateMiseAJour: "À l'instant",
              approuvePar: "Karim Mansouri (Chef UP Centre)",
              notes: "Approuvé par le Chef d'Unité. Ordre d'expédition transmis au transporteur régional.",
            }
          : t
      )
    );

    // Enregistrement dans l'audit trail (§4.4 & §10 Étape 6)
    const newAudit: AuditSecurityEvent = {
      id: `AUD-UP-${auditLogs.length + 12}`,
      timestamp: new Date().toLocaleTimeString("fr-FR"),
      userEmail: "chef@unit_p.com",
      userRole: "Unité de production",
      agenceId: "up-centre (Entrepôt)",
      action: "TRANSFER_PROPOSAL_APPROVED",
      ressource: `/transfers/${transfertId}`,
      statut: "autorise",
      details: `Approbation du transfert de ${tr.quantite} unités (${PRODUITS.find((p) => p.id === tr.produitId)?.modele}) de ${AGENCES.find((a) => a.id === tr.sourceAgenceId)?.nom} vers ${AGENCES.find((a) => a.id === tr.destinationAgenceId)?.nom}.`,
    };
    setAuditLogs([newAudit, ...auditLogs]);

    showToast(`✓ Transfert ${transfertId} approuvé avec succès ! L'audit trail a été mis à jour.`);
  };

  const handleRejectTransfer = (transfertId: string) => {
    setTransferts((prev) =>
      prev.map((t) =>
        t.id === transfertId
          ? {
              ...t,
              statut: "rejeté",
              dateMiseAJour: "À l'instant",
              approuvePar: "Karim Mansouri (Chef UP Centre)",
              notes: "Rejeté pour motifs d'arbitrage de stock local prioritaire.",
            }
          : t
      )
    );
    showToast(`Transfert ${transfertId} refusé.`);
  };

  // Création d'un Ordre de Fabrication usine
  const handleCreateOF = (e: React.FormEvent) => {
    e.preventDefault();
    const p = PRODUITS.find((pr) => pr.id === ofModelId);
    const newOF: ProductionOrder = {
      id: `OF-2026-0${ordresFabrication.length + 45}`,
      produitId: ofModelId,
      uniteProductionId: "up-centre",
      quantite: ofQuantity,
      statut: "En cours",
      dateLancement: "Aujourd'hui",
      dateFinEstimee: "Dans 7 jours",
      priorite: ofPriority,
    };

    setOrdresFabrication([newOF, ...ordresFabrication]);
    setShowNewOFModal(false);
    showToast(`Ordre de fabrication ${newOF.id} lancé pour ${ofQuantity} ${p?.modele} !`);
  };

  // Lancement coordination Inter-UP
  const handleCreateInterUP = (e: React.FormEvent) => {
    e.preventDefault();
    const p = PRODUITS.find((pr) => pr.id === interUPModelId);
    const newTr: DemandeTransfert = {
      id: `TR-INT-0${transferts.length + 90}`,
      produitId: interUPModelId,
      sourceAgenceId: "up-centre",
      destinationAgenceId: interUPDestUnit,
      quantite: interUPQuantity,
      statut: "en_attente_approbation",
      raisonRecommandation: "Transfert inter-unités de rééquilibrage capacitaire soumis à la Direction.",
      dateCreation: "À l'instant",
      dateMiseAJour: "À l'instant",
      typeTransfert: "inter_up",
    };

    setTransferts([newTr, ...transferts]);
    setShowInterUPModal(false);
    showToast(`Demande de transfert inter-unités ${newTr.id} transmise à la Direction !`);
  };

  const upCentreData = UNITES_PRODUCTION.find((u) => u.id === "up-centre")!;
  const chartRegional = PREVISIONS_PAR_MODELE["regional_centre"];

  return (
    <div className="min-h-screen bg-[#F4F6F9] flex font-sans text-slate-800">
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
                  Production &bull; Centre
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
              Pilotage Usine
            </div>
            {[
              { id: "dashboard", label: "Tableau de Bord", icon: Factory },
              { id: "warehouse", label: "Entrepôt Régional", icon: Warehouse },
              { id: "agences", label: "Agences du Cluster (3)", icon: Users },
              { id: "approbations", label: `Approbations (${transfertsEnAttente.length})`, icon: ArrowRightLeft, badge: transfertsEnAttente.length },
              { id: "fabrication", label: "Fabrication & Cadence", icon: Activity },
              { id: "audit", label: "Audit & Traçabilité", icon: ShieldCheck },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as UPTabId);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    isActive
                      ? "bg-[#D90016] text-white shadow-sm shadow-[#D90016]/30"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="flex-1 text-left">{tab.label}</span>
                  {tab.badge && tab.badge > 0 && !isActive && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#D90016] text-white">
                      {tab.badge}
                    </span>
                  )}
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
                UP
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">Karim Mansouri</div>
                <div className="text-[10px] text-slate-400 truncate font-mono">chef@unit_p.com</div>
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
            <span className="font-extrabold text-sm text-slate-900">Unité de Production</span>
            <span className="text-slate-300">/</span>
            <span className="text-xs font-mono text-slate-500">Site Rouïba / Blida (#UP-01)</span>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-900 border border-amber-500/25 uppercase">
              Données simulées
            </span>
            <button
              onClick={() => setShowNewOFModal(true)}
              className="px-3 py-1.5 rounded-xl bg-[#D90016] hover:bg-[#b80013] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Nouvel OF</span>
            </button>
          </div>
        </header>

        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* En-tête Titre UP */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-lg bg-[#D90016]/10 text-[#D90016] border border-[#D90016]/20 text-xs font-bold font-mono">
                  SITE INDUSTRIEL #UP-01 (CENTRE)
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Zone Industrielle Rouïba / Blida &bull; 3 Agences Rattachées
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
                Supervision Unité de Production — Région Centre
              </h1>
              <p className="text-xs text-slate-500">
                Coordination de l&apos;approvisionnement, arbitrage des pénuries régionales et validation des transferts
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowNewOFModal(true)}
                className="px-3.5 py-2 rounded-xl bg-[#D90016] hover:bg-[#b80013] text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#D90016]/20 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Lancer Ordre de Fabrication</span>
              </button>
              <button
                onClick={() => setShowInterUPModal(true)}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <ArrowRightLeft className="w-3.5 h-3.5 text-[#D90016]" />
                <span>Coordination Inter-UP</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4 KPIs Clés UP */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            onClick={() => setActiveTab("warehouse")}
            className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs cursor-pointer hover:border-[#D90016] transition"
          >
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>Stock Entrepôt UP</span>
              <span className="p-2 bg-red-50 rounded-xl text-[#D90016]">
                <Warehouse className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{totalStockWarehouse}</span>
              <span className="text-xs text-slate-500">/ 250 capacité</span>
            </div>
            <div className="mt-2 text-[11px] text-[#D90016] font-medium">
              Taux d&apos;occupation entrepôt : 56.8%
            </div>
          </div>

          <div
            onClick={() => setActiveTab("agences")}
            className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs cursor-pointer hover:border-blue-400 transition"
          >
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>Agences en Cluster</span>
              <span className="p-2 bg-blue-50 rounded-xl text-blue-600">
                <Users className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">3 Agences</span>
              <span className="text-xs text-blue-600 font-semibold">100% connectées</span>
            </div>
            <div className="mt-2 text-[11px] text-slate-500">
              Alger Centre, Blida, Tipaza
            </div>
          </div>

          <div
            onClick={() => setActiveTab("approbations")}
            className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs cursor-pointer hover:border-[#D90016] transition"
          >
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>Approbations en Attente</span>
              <span className="p-2 bg-red-50 rounded-xl text-[#D90016]">
                <Clock className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#D90016]">
                {transfertsEnAttente.length}
              </span>
              <span className="text-xs text-amber-600 font-bold">Transferts soumis</span>
            </div>
            <div className="mt-2 text-[11px] text-[#D90016] font-medium flex items-center gap-1">
              <span>1 transfert prioritaire Blida &rarr; Alger</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>

          <div
            onClick={() => setActiveTab("fabrication")}
            className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs cursor-pointer hover:border-purple-400 transition"
          >
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>Ordres de Fabrication</span>
              <span className="p-2 bg-purple-50 rounded-xl text-purple-600">
                <Activity className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{ofActifs.length}</span>
              <span className="text-xs text-purple-600 font-semibold">en production</span>
            </div>
            <div className="mt-2 text-[11px] text-slate-500">
              Cadence hebdomadaire : 85 unités
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* TAB 1 : TABLEAU DE BORD RÉGIONAL UP                                 */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Synthèse des Pénuries & Excédents du Cluster (AGENTS.md §2 & §4) */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#D90016]" />
                      Écarts & Opportunités de Rééquilibrage
                    </h2>
                    <p className="text-xs text-slate-500">
                      Détection automatique des transferts entre agences du cluster
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("approbations")}
                    className="text-xs text-[#D90016] font-bold hover:underline"
                  >
                    Valider les transferts &rarr;
                  </button>
                </div>

                <div className="mt-4 space-y-3">
                  {/* Cas Clé Démo 1 : Cirta 125 */}
                  <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900 text-sm">Cirta 125</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-900">
                            Opportunité de Transfert Équilibré
                          </span>
                        </div>
                        <div className="text-xs text-slate-700 mt-1">
                          <strong>Agence Alger Centre :</strong> 3 unités (Déficit de -2 sous le seuil de sécurité)<br />
                          <strong>Agence Blida :</strong> 8 unités (Excédent net de +4 unités au-dessus du seuil protégé)
                        </div>
                        <p className="text-xs text-amber-900 font-medium mt-2">
                          &rarr; Recommandation VMS SMART : Transférer 4 Cirta 125 de Blida vers Alger Centre.
                        </p>
                      </div>

                      <button
                        onClick={() => handleApproveTransfer("TR-2026-081")}
                        className="px-3 py-1.5 rounded-lg bg-[#D90016] hover:bg-[#b80013] text-white font-bold text-xs shrink-0 shadow-xs cursor-pointer"
                      >
                        Approuver Immédiatement
                      </button>
                    </div>
                  </div>

                  {/* Cas 2 : Jumper 150 */}
                  <div className="p-4 rounded-xl bg-red-50/70 border border-red-200">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900 text-sm">Jumper 150</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-200 text-red-900">
                            Rupture Totale Agence Alger
                          </span>
                        </div>
                        <div className="text-xs text-slate-700 mt-1">
                          Alger Centre : 0 unité en stock &bull; Entrepôt UP Centre : 19 unités disponibles.
                        </div>
                        <p className="text-xs text-red-900 font-medium mt-2">
                          &rarr; Réapprovisionnement de 3 unités en cours d&apos;acheminement (Camionnette #TC-04).
                        </p>
                      </div>

                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                        En transit
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Demande Régionale Agrégée */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    Demande Agrégée Région Centre
                  </h2>
                  <p className="text-xs text-slate-500 mt-2">
                    Cumul des ventes & prévisions pour Alger, Blida et Tipaza :
                  </p>

                  <div className="h-44 w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartRegional} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="mois" tick={{ fontSize: 10, fill: "#64748b" }} />
                        <YAxis tick={{ fontSize: 10, fill: "#64748b" }} />
                        <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                        <Area type="monotone" dataKey="ventes" name="Ventes" stroke="#D90016" fill="#D90016" fillOpacity={0.15} />
                        <Area type="monotone" dataKey="prevision" name="Prévision" stroke="#f59e0b" strokeDasharray="3 3" fill="#f59e0b" fillOpacity={0.1} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
                  Prévision mois prochain : <strong>79 motos</strong> pour le cluster Centre.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* TAB 2 : ENTREPÔT CENTRAL UP                                         */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {activeTab === "warehouse" && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Warehouse className="w-4 h-4 text-[#D90016]" />
                  Inventaire de l&apos;Entrepôt Régional UP Centre
                </h2>
                <p className="text-xs text-slate-500">
                  Stocks tampons réservés pour l&apos;approvisionnement d&apos;urgence des agences du cluster
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-[#D90016] border border-red-200">
                142 / 250 unités en stock physique
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-100 font-semibold">
                  <tr>
                    <th className="px-4 py-3">Modèle VMS</th>
                    <th className="px-4 py-3 text-right">Disponible Immédiat</th>
                    <th className="px-4 py-3 text-right">Quantité Réservée</th>
                    <th className="px-4 py-3 text-right">Stock Sécurité Entrepôt</th>
                    <th className="px-4 py-3 text-right">Cadence Usine / Semaine</th>
                    <th className="px-4 py-3 text-center">État Disponibilité</th>
                    <th className="px-4 py-3 text-right">Action Entrepôt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {warehouseStocks.map((w) => {
                    const p = PRODUITS.find((pr) => pr.id === w.produitId)!;
                    return (
                      <tr key={w.id} className="hover:bg-slate-50/70 transition">
                        <td className="px-4 py-3.5">
                          <div className="font-bold text-slate-900 text-xs">{p.modele}</div>
                          <div className="text-[11px] text-slate-500">{p.categorie}</div>
                        </td>
                        <td className="px-4 py-3.5 text-right font-extrabold text-slate-900 text-sm">
                          {w.quantiteDisponible} u.
                        </td>
                        <td className="px-4 py-3.5 text-right text-amber-700 font-semibold">
                          {w.quantiteReservee} u.
                        </td>
                        <td className="px-4 py-3.5 text-right text-slate-600 font-mono">
                          {w.stockSecurite} u.
                        </td>
                        <td className="px-4 py-3.5 text-right text-[#D90016] font-bold">
                          +{w.cadenceFabricationSemaine} u. / sem
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Disponible
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <button
                            onClick={() => {
                              setOfModelId(w.produitId);
                              setShowNewOFModal(true);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-semibold transition"
                          >
                            Produire lot
                          </button>
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
        {/* TAB 3 : AGENCES DU CLUSTER (3 AGENCES RATTACHÉES)                   */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {activeTab === "agences" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
              <h2 className="text-base font-bold text-slate-900 mb-1">
                Supervision des 3 Agences du Cluster Centre (§2 AGENTS.md)
              </h2>
              <p className="text-xs text-slate-500 mb-4">
                L&apos;Unité de Production a une vue transparente sur ses agences rattachées pour identifier les stocks dormants et ruptures
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Agence Alger */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">Agence Alger Centre (#AG-001)</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800">
                      2 Ruptures/Alertes
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Responsable : Karim Benali &bull; Alger
                  </div>
                  <div className="space-y-1.5 text-xs pt-2 border-t border-slate-200">
                    <div className="flex justify-between">
                      <span>Cirta 125 :</span> <strong className="text-red-600">3 u. (Min: 5)</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Jumper 150 :</span> <strong className="text-red-600">0 u. (Min: 4)</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Clio 125 :</span> <strong className="text-slate-800">12 u. (Min: 4)</strong>
                    </div>
                  </div>
                </div>

                {/* Agence Blida */}
                <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">Agence Blida (#AG-002)</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Excédent Cirta (+4)
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Responsable : Sara Mansouri &bull; Blida
                  </div>
                  <div className="space-y-1.5 text-xs pt-2 border-t border-emerald-200">
                    <div className="flex justify-between">
                      <span>Cirta 125 :</span> <strong className="text-emerald-700">8 u. (Min: 4) &rarr; +4 Excédent</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Clio 125 :</span> <strong className="text-slate-800">5 u. (Min: 3)</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Jumper 150 :</span> <strong className="text-slate-800">5 u. (Min: 3)</strong>
                    </div>
                  </div>
                </div>

                {/* Agence Tipaza */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">Agence Tipaza (#AG-003)</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Stock Nominal
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Responsable : Ahmed Zidane &bull; Tipaza
                  </div>
                  <div className="space-y-1.5 text-xs pt-2 border-t border-slate-200">
                    <div className="flex justify-between">
                      <span>Saphir 150 :</span> <strong className="text-emerald-700">5 u. (Min: 2) &rarr; +3 Excédent</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Cirta 125 :</span> <strong className="text-slate-800">4 u. (Min: 3)</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Clio 125 :</span> <strong className="text-slate-800">6 u. (Min: 3)</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* TAB 4 : APPROBATIONS DES TRANSFERTS (ACTION CLÉ HACKATHON)          */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {activeTab === "approbations" && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ArrowRightLeft className="w-4 h-4 text-[#D90016]" />
                  Validation des Transferts Régionaux
                </h2>
                <p className="text-xs text-slate-500">
                  Approbation des demandes de réapprovisionnement et transferts inter-agences
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {transferts.map((tr) => {
                const p = PRODUITS.find((pr) => pr.id === tr.produitId);
                const agenceSrc = AGENCES.find((a) => a.id === tr.sourceAgenceId);
                const agenceDst = AGENCES.find((a) => a.id === tr.destinationAgenceId);
                const isPending = tr.statut === "en_attente_approbation";

                return (
                  <div key={tr.id} className="py-4 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900">{tr.id}</span>
                        <span className="text-slate-400">&bull;</span>
                        <span className="font-bold text-xs text-[#D90016]">
                          {p?.modele} ({tr.quantite} unités)
                        </span>
                        <span className="text-slate-400">&bull;</span>
                        <span className="text-[11px] text-slate-500">
                          {agenceSrc?.nom || "Entrepôt UP"} &rarr; {agenceDst?.nom || "Agence Destinataire"}
                        </span>
                      </div>

                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          tr.statut === "approuvé"
                            ? "bg-teal-50 text-emerald-700 border border-emerald-200"
                            : tr.statut === "en_attente_approbation"
                            ? "bg-amber-100 text-amber-900 font-bold"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {tr.statut === "en_attente_approbation" ? "Action Requise : En attente" : tr.statut}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 leading-relaxed">
                      {tr.raisonRecommandation}
                    </p>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-slate-400 italic">
                        {tr.notes || "Généré par le système d'optimisation VMS SMART."}
                      </span>

                      {isPending && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleRejectTransfer(tr.id)}
                            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 text-xs font-semibold transition cursor-pointer"
                          >
                            Refuser
                          </button>
                          <button
                            onClick={() => handleApproveTransfer(tr.id)}
                            className="px-3 py-1.5 rounded-lg bg-[#D90016] hover:bg-[#b80013] text-white text-xs font-bold shadow-xs transition cursor-pointer flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approuver le Transfert</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* TAB 5 : FABRICATION & CADENCE USINE                                 */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {activeTab === "fabrication" && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-purple-600" />
                  Ordres de Fabrication (OF) & Lignes d&apos;Assemblage Usine
                </h2>
                <p className="text-xs text-slate-500">
                  Planification des séries de fabrication pour alimenter l&apos;entrepôt régional
                </p>
              </div>
              <button
                onClick={() => setShowNewOFModal(true)}
                className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nouveau Lot OF</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-100 font-semibold">
                  <tr>
                    <th className="px-4 py-3">Numéro OF</th>
                    <th className="px-4 py-3">Modèle VMS</th>
                    <th className="px-3 py-3 text-right">Quantité Série</th>
                    <th className="px-3 py-3">Date Lancement</th>
                    <th className="px-3 py-3">Fin Estimée</th>
                    <th className="px-3 py-3 text-center">Priorité</th>
                    <th className="px-3 py-3 text-center">Statut Usine</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ordresFabrication.map((of) => {
                    const p = PRODUITS.find((pr) => pr.id === of.produitId);
                    return (
                      <tr key={of.id} className="hover:bg-slate-50/70 transition">
                        <td className="px-4 py-3 font-mono font-bold text-slate-900">{of.id}</td>
                        <td className="px-4 py-3 font-bold text-purple-900">{p?.modele}</td>
                        <td className="px-3 py-3 text-right font-extrabold text-slate-900 text-sm">
                          {of.quantite} unités
                        </td>
                        <td className="px-3 py-3 text-slate-600">{of.dateLancement}</td>
                        <td className="px-3 py-3 text-slate-600">{of.dateFinEstimee}</td>
                        <td className="px-3 py-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              of.priorite === "Haute" ? "bg-red-50 text-red-700 border border-red-200" : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {of.priorite}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              of.statut === "En cours"
                                ? "bg-amber-100 text-amber-900"
                                : of.statut === "Terminé"
                                ? "bg-emerald-100 text-emerald-900"
                                : "bg-blue-100 text-blue-900"
                            }`}
                          >
                            {of.statut}
                          </span>
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
        {/* TAB 6 : AUDIT & TRAÇABILITÉ UP                                      */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {activeTab === "audit" && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#D90016]" />
                  Journal d&apos;Audit & Décisions de l&apos;Unité de Production (§4.6 AGENTS.md)
                </h2>
                <p className="text-xs text-slate-500">
                  Trace immuable de chaque approbation, rejet ou mouvement de stock initié par l&apos;UP Centre
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-100 border border-slate-200/70 rounded-xl overflow-hidden">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-3.5 bg-white text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-800">{log.id}</span>
                      <span className="text-slate-400">&bull;</span>
                      <span className="text-slate-500">{log.timestamp}</span>
                      <span className="text-slate-400">&bull;</span>
                      <span className="font-mono text-slate-700">{log.action}</span>
                    </div>
                    <p className="text-slate-600 mt-1 leading-relaxed">{log.details}</p>
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0 self-start sm:self-center uppercase">
                    Vérifié
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Modal Nouvel OF */}
      {showNewOFModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Lancer un Ordre de Fabrication (OF)</h3>
              <button onClick={() => setShowNewOFModal(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateOF} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Modèle VMS</label>
                <select
                  value={ofModelId}
                  onChange={(e) => setOfModelId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#D90016] focus:outline-none"
                >
                  {PRODUITS.map((p) => (
                    <option key={p.id} value={p.id}>{p.modele} ({p.categorie})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Quantité à Fabriquer</label>
                <input
                  type="number"
                  min="5"
                  max="100"
                  required
                  value={ofQuantity}
                  onChange={(e) => setOfQuantity(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#D90016] focus:outline-none font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Priorité</label>
                <select
                  value={ofPriority}
                  onChange={(e) => setOfPriority(e.target.value as "Haute" | "Normale")}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#D90016] focus:outline-none"
                >
                  <option value="Haute">Haute (Rupture agence imminente)</option>
                  <option value="Normale">Normale (Constitution stock tampon)</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button type="button" onClick={() => setShowNewOFModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl">
                  Annuler
                </button>
                <button type="submit" className="px-4 py-2 bg-[#D90016] hover:bg-[#b80013] text-white rounded-xl font-bold">
                  Lancer l&apos;Ordre
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Inter-UP */}
      {showInterUPModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Coordination Inter-Unités de Production</h3>
              <button onClick={() => setShowInterUPModal(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateInterUP} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Unité de Production Partenaire</label>
                <select
                  value={interUPDestUnit}
                  onChange={(e) => setInterUPDestUnit(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                >
                  <option value="up-est">UP Est (Constantine / Annaba)</option>
                  <option value="up-ouest">UP Ouest (Oran / Tlemcen)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Modèle à Transférer</label>
                <select
                  value={interUPModelId}
                  onChange={(e) => setInterUPModelId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                >
                  {PRODUITS.map((p) => (
                    <option key={p.id} value={p.id}>{p.modele}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Quantité (Unités)</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  required
                  value={interUPQuantity}
                  onChange={(e) => setInterUPQuantity(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button type="button" onClick={() => setShowInterUPModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl">
                  Annuler
                </button>
                <button type="submit" className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold">
                  Transmettre à la Direction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

        <footer className="border-t border-slate-200/80 bg-white px-6 py-3 text-center text-[11px] text-slate-400 mt-auto">
          VMS SMART &bull; Espace Unité de Production &bull; Hackathon VMS Industrie 2026
        </footer>
      </div>
    </div>
  );
}
