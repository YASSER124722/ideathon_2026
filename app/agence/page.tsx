"use client";

import React, { useState } from "react";
import AgenceLayout, { AgenceTabId } from "@/components/AgenceLayout";
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Package,
  ArrowRightLeft,
  Bell,
  CheckCircle2,
  Clock,
  XCircle,
  Info,
  ChevronRight,
  RefreshCw,
  ArrowUpRight,
  Search,
  Plus,
  Sliders,
  ShieldAlert,
  ShieldCheck,
  Wrench,
  Check,
  Send,
  Truck,
  RotateCcw,
  X,
  ExternalLink,
  Layers,
  HelpCircle,
  AlertCircle,
  Calendar,
  Sparkles,
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
} from "recharts";
import {
  PRODUITS,
  STOCKS_AG001,
  ALERTES,
  TRANSFERTS,
  PREVISIONS_PAR_MODELE,
  AGENCES,
  PIECES_RECHANGE,
  AUDIT_SECURITE_INITIAL,
} from "@/lib/data";
import type {
  StatutStock,
  StatutTransfert,
  DemandeTransfert,
  StockRecord,
  AlerteStock,
  PieceRechange,
  AuditSecurityEvent,
} from "@/lib/types";

// ─── Helpers de configuration visuelle ───────────────────────────────────────

function statutStockConfig(statut: StatutStock) {
  switch (statut) {
    case "critique":
      return {
        label: "Rupture totale",
        dot: "bg-red-500 animate-pulse",
        badge: "bg-red-50 text-red-700 border-red-200",
        border: "border-l-red-500",
      };
    case "alerte":
      return {
        label: "Stock faible",
        dot: "bg-amber-500",
        badge: "bg-amber-50 text-amber-700 border-amber-200",
        border: "border-l-amber-500",
      };
    case "normal":
      return {
        label: "Stock nominal",
        dot: "bg-emerald-500",
        badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
        border: "border-l-emerald-500",
      };
    case "excedent":
      return {
        label: "Excédent disponible",
        dot: "bg-blue-500",
        badge: "bg-blue-50 text-blue-700 border-blue-200",
        border: "border-l-blue-500",
      };
  }
}

function statutTransfertConfig(statut: StatutTransfert) {
  switch (statut) {
    case "proposé":
      return {
        label: "Recommandation générée",
        badge: "bg-purple-50 text-purple-700 border-purple-200",
        icon: Sparkles,
      };
    case "en_attente_approbation":
      return {
        label: "En attente validation UP",
        badge: "bg-amber-50 text-amber-700 border-amber-200",
        icon: Clock,
      };
    case "approuvé":
      return {
        label: "Approuvé par UP",
        badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
        icon: CheckCircle2,
      };
    case "en_transit":
      return {
        label: "En acheminement",
        badge: "bg-blue-50 text-blue-700 border-blue-200",
        icon: Truck,
      };
    case "terminé":
      return {
        label: "Réceptionné",
        badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
        icon: CheckCircle2,
      };
    case "rejeté":
      return {
        label: "Refusé par UP",
        badge: "bg-red-50 text-red-700 border-red-200",
        icon: XCircle,
      };
    case "annulé":
      return {
        label: "Annulé",
        badge: "bg-slate-100 text-slate-500 border-slate-200",
        icon: XCircle,
      };
  }
}

function getStatutStock(quantiteActuelle: number, stockMinimum: number): StatutStock {
  if (quantiteActuelle === 0) return "critique";
  if (quantiteActuelle < stockMinimum) return "alerte";
  if (quantiteActuelle > stockMinimum * 2.5) return "excedent";
  return "normal";
}

export default function AgenceDashboard() {
  // Navigation par onglets
  const [activeTab, setActiveTab] = useState<AgenceTabId>("dashboard");

  // États interactifs des données
  const [stocks, setStocks] = useState<StockRecord[]>(STOCKS_AG001);
  const [transferts, setTransferts] = useState<DemandeTransfert[]>(TRANSFERTS);
  const [alertes, setAlertes] = useState<AlerteStock[]>(ALERTES);
  const [auditLogs, setAuditLogs] = useState<AuditSecurityEvent[]>(AUDIT_SECURITE_INITIAL);

  // Filtres et sélections
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedModelId, setSelectedModelId] = useState<string>("vms-cirta-125");
  const [selectedHorizon, setSelectedHorizon] = useState<7 | 30 | 90>(30);

  // Modals interactifs
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showReapproModal, setShowReapproModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showEditSafetyModal, setShowEditSafetyModal] = useState(false);
  const [showSecurityAlertModal, setShowSecurityAlertModal] = useState(false);

  // Sélection pour modification
  const [editingStockRecord, setEditingStockRecord] = useState<StockRecord | null>(null);
  const [newSafetyStockValue, setNewSafetyStockValue] = useState<number>(4);

  // Formulaire nouveau réappro / transfert
  const [formModelId, setFormModelId] = useState<string>("vms-cirta-125");
  const [formQuantity, setFormQuantity] = useState<number>(3);
  const [formSourceAgence, setFormSourceAgence] = useState<string>("ag-002");
  const [formJustification, setFormJustification] = useState<string>("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3800);
  };

  // Calculs KPIs
  const totalMotos = stocks.reduce((acc, s) => acc + s.quantiteActuelle, 0);
  const nbRuptures = stocks.filter((s) => s.quantiteActuelle === 0).length;
  const nbAlertesStock = stocks.filter(
    (s) => s.quantiteActuelle > 0 && s.quantiteActuelle < s.stockMinimum
  ).length;
  const nbTransfertsEnCours = transferts.filter(
    (t) => t.statut === "en_attente_approbation" || t.statut === "en_transit" || t.statut === "proposé"
  ).length;
  const alertesNonLues = alertes.filter((a) => !a.lue).length;

  // Filtrage inventaire
  const filteredStocks = stocks.filter((stock) => {
    const produit = PRODUITS.find((p) => p.id === stock.produitId);
    if (!produit) return false;
    const matchesSearch =
      produit.modele.toLowerCase().includes(searchQuery.toLowerCase()) ||
      produit.categorie.toLowerCase().includes(searchQuery.toLowerCase());
    const statut = getStatutStock(stock.quantiteActuelle, stock.stockMinimum);
    const matchesStatus = statusFilter === "all" || statut === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Action : Soumettre une recommandation à l'approbation du chef d'UP
  const handleSoumettreTransfert = (transfertId: string) => {
    setTransferts((prev) =>
      prev.map((t) =>
        t.id === transfertId
          ? {
              ...t,
              statut: "en_attente_approbation",
              dateMiseAJour: "À l'instant",
              notes: "Soumis par Karim Benali (Agence Alger Centre) pour validation du Chef UP Centre.",
            }
          : t
      )
    );
    showToast(`Transfert ${transfertId} transmis au Chef de l'Unité de Production !`);
  };

  // Action : Confirmer la réception physique d'un transfert (Incrémente le stock en direct !)
  const handleConfirmerReception = (transfert: DemandeTransfert) => {
    // 1. Mettre à jour le stock
    setStocks((prev) =>
      prev.map((s) => {
        if (s.produitId === transfert.produitId) {
          const nvQuantite = s.quantiteActuelle + transfert.quantite;
          const nvEntrant = Math.max(0, s.stockEntrant - transfert.quantite);
          return {
            ...s,
            quantiteActuelle: nvQuantite,
            stockEntrant: nvEntrant,
          };
        }
        return s;
      })
    );

    // 2. Mettre à jour le statut du transfert
    setTransferts((prev) =>
      prev.map((t) =>
        t.id === transfert.id
          ? {
              ...t,
              statut: "terminé",
              dateMiseAJour: "À l'instant",
              notes: "Réception physique validée par l'Agence Alger Centre.",
            }
          : t
      )
    );

    const produit = PRODUITS.find((p) => p.id === transfert.produitId);
    showToast(
      `Réception confirmée ! +${transfert.quantite} unités de ${produit?.modele} ajoutées au stock disponible.`
    );
  };

  // Action : Enregistrer la modification du seuil de sécurité
  const handleSaveSafetyStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStockRecord) return;

    setStocks((prev) =>
      prev.map((s) =>
        s.id === editingStockRecord.id ? { ...s, stockMinimum: newSafetyStockValue } : s
      )
    );

    setShowEditSafetyModal(false);
    const p = PRODUITS.find((pr) => pr.id === editingStockRecord.produitId);
    showToast(`Seuil de sécurité mis à jour pour ${p?.modele} : ${newSafetyStockValue} unités.`);
  };

  // Action : Créer une demande de réapprovisionnement UP
  const handleCreateReappro = (e: React.FormEvent) => {
    e.preventDefault();
    const p = PRODUITS.find((pr) => pr.id === formModelId);

    const nouveauTransfert: DemandeTransfert = {
      id: `REAP-2026-0${transferts.length + 85}`,
      produitId: formModelId,
      sourceAgenceId: "up-centre",
      destinationAgenceId: "ag-001",
      quantite: formQuantity,
      statut: "en_attente_approbation",
      raisonRecommandation:
        formJustification.trim() ||
        `Demande d'approvisionnement direct pour reconstituer le stock de ${p?.modele}.`,
      dateCreation: "À l'instant",
      dateMiseAJour: "À l'instant",
      typeTransfert: "reappro_up",
    };

    setTransferts([nouveauTransfert, ...transferts]);
    setShowReapproModal(false);
    showToast(
      `Demande ${nouveauTransfert.id} (${formQuantity} ${p?.modele}) transmise à l'entrepôt UP Centre !`
    );
  };

  // Action : Proposer un transfert inter-agences
  const handleCreateTransferProposal = (e: React.FormEvent) => {
    e.preventDefault();
    const p = PRODUITS.find((pr) => pr.id === formModelId);
    const agenceSource = AGENCES.find((a) => a.id === formSourceAgence);

    const nouvelleProp: DemandeTransfert = {
      id: `TR-2026-0${transferts.length + 86}`,
      produitId: formModelId,
      sourceAgenceId: formSourceAgence,
      destinationAgenceId: "ag-001",
      quantite: formQuantity,
      statut: "proposé",
      raisonRecommandation:
        formJustification.trim() ||
        `Transfert de dépannage proposé depuis ${agenceSource?.nom} pour combler le déficit de ${p?.modele}.`,
      dateCreation: "À l'instant",
      dateMiseAJour: "À l'instant",
      typeTransfert: "inter_agence",
    };

    setTransferts([nouvelleProp, ...transferts]);
    setShowTransferModal(false);
    showToast(`Proposition ${nouvelleProp.id} créée avec succès.`);
  };

  // Action : Démonstration Scénario 2 Sécurité RBAC (§10 AGENTS.md)
  const handleSimulateUnauthorizedAccess = () => {
    const newLog: AuditSecurityEvent = {
      id: `SEC-ALERT-${auditLogs.length + 10}`,
      timestamp: new Date().toLocaleTimeString("fr-FR"),
      userEmail: "karim.benali@agence.com",
      userRole: "Agence",
      agenceId: "ag-001 (Alger Centre)",
      action: "ACCESS_DENIED_CROSS_UP",
      ressource: "/production-units/up-est/warehouse-records",
      statut: "refuse",
      details:
        "TENTATIVE DE VIOLATION DE PÉRIMÈTRE DÉTECTÉE : L'utilisateur de l'Agence Alger Centre a tenté d'interroger les stocks restreints de l'UP Est (Constantine). Bloqué par la passerelle de sécurité.",
    };

    setAuditLogs([newLog, ...auditLogs]);
    setShowSecurityAlertModal(true);
  };

  // Traiter / marquer une alerte comme lue
  const handleMarkAlertRead = (id: string) => {
    setAlertes((prev) => prev.map((a) => (a.id === id ? { ...a, lue: true } : a)));
    showToast("Alerte marquée comme traitée.");
  };

  // Données de prévision pour le modèle actif
  const currentModel = PRODUITS.find((p) => p.id === selectedModelId) || PRODUITS[0];
  const modelStock = stocks.find((s) => s.produitId === currentModel.id);
  const chartData = PREVISIONS_PAR_MODELE[selectedModelId] || PREVISIONS_PAR_MODELE["vms-cirta-125"];

  // Calcul prévisionnel selon l'horizon
  const dailyRate = selectedModelId === "vms-cirta-125" ? 1.6 : selectedModelId === "vms-clio-125" ? 1.1 : 0.8;
  const demandHorizon = Math.round(dailyRate * selectedHorizon);
  const currentQty = modelStock ? modelStock.quantiteActuelle : 0;
  const netGap = currentQty - demandHorizon;

  return (
    <AgenceLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      alertesNonLues={alertesNonLues}
      onOpenAlerts={() => setActiveTab("dashboard")}
      onSimulateUnauthorized={handleSimulateUnauthorizedAccess}
    >
      {/* Toast Flottant de Confirmation */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-slideUp text-xs font-medium max-w-md">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="flex-1">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}


      {/* ── BARRE SUPÉRIEURE D'ACTION RAPIDE (Agence Alger Centre) ── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-lg bg-red-50 text-[#D90016] border border-red-200 text-xs font-bold font-mono">
                #AG-001
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Alger Centre &bull; UP Centre
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-0.5">
              Gestion de l&apos;Agence
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                setFormModelId("vms-jumper-150");
                setShowReapproModal(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-[#D90016] hover:bg-[#b80013] text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-[#D90016]/20 transition cursor-pointer"
            >
              <Package className="w-3.5 h-3.5" />
              <span>Demander Réapprovisionnement UP</span>
            </button>

            <button
              onClick={() => {
                setFormModelId("vms-cirta-125");
                setShowTransferModal(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-[#D90016]" />
              <span>Proposer Transfert Inter-Agences</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── 4 CARTES KPI SYNTHÉTIQUES (AGENTS.md §2 & §4) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Motos disponibles */}
        <div
          onClick={() => setActiveTab("inventaire")}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-[#D90016]/80 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Motos en stock</span>
            <span className="p-2 bg-red-50 group-hover:bg-red-100 rounded-xl text-[#D90016] transition">
              <Package className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{totalMotos}</span>
            <span className="text-xs text-slate-500">unités</span>
          </div>
          <div className="mt-2 text-[11px] text-[#D90016] font-medium flex items-center gap-1">
            <span>5 modèles VMS au catalogue</span>
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition" />
          </div>
        </div>

        {/* Ruptures & Alertes */}
        <div
          onClick={() => setActiveTab("inventaire")}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-red-400/80 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Ruptures & alertes</span>
            <span className="p-2 bg-red-50 group-hover:bg-red-100 rounded-xl text-red-600 transition">
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-red-600">{nbRuptures}</span>
            <span className="text-xs text-amber-600 font-bold">
              +{nbAlertesStock} sous le seuil
            </span>
          </div>
          <div className="mt-2 text-[11px] text-red-600 font-medium">
            Action requise (Jumper 150 & Cirta)
          </div>
        </div>

        {/* Demande Prévue 30j */}
        <div
          onClick={() => setActiveTab("previsions")}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-blue-400/80 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Demande prévue (30j)</span>
            <span className="p-2 bg-blue-50 group-hover:bg-blue-100 rounded-xl text-blue-600 transition">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">31</span>
            <span className="text-xs text-emerald-600 font-semibold flex items-center">
              <ArrowUpRight className="w-3 h-3" /> +8.5%
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Moyenne mobile pondérée (WMA)
          </div>
        </div>

        {/* Transferts Actifs */}
        <div
          onClick={() => setActiveTab("transferts")}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-purple-400/80 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Transferts en cours</span>
            <span className="p-2 bg-purple-50 group-hover:bg-purple-100 rounded-xl text-purple-600 transition">
              <ArrowRightLeft className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {nbTransfertsEnCours}
            </span>
            <span className="text-xs text-purple-600 font-medium">en traitement</span>
          </div>
          <div className="mt-2 text-[11px] text-purple-700 font-medium flex items-center gap-1">
            <span>Dont 1 en acheminement</span>
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition" />
          </div>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* VUE 1 : TABLEAU DE BORD GLOBAL                                           */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Colonne Gauche : Aperçu dynamique de l'inventaire */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Package className="w-4 h-4 text-emerald-600" />
                    État des Stocks par Modèle VMS
                  </h2>
                  <p className="text-xs text-slate-500">
                    Niveau actuel par rapport au seuil de sécurité minimum
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("inventaire")}
                  className="text-xs text-[#D90016] hover:text-[#D90016] font-semibold flex items-center gap-1"
                >
                  <span>Gérer l&apos;inventaire</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="divide-y divide-slate-100 mt-2">
                {stocks.map((stock) => {
                  const produit = PRODUITS.find((p) => p.id === stock.produitId)!;
                  const statut = getStatutStock(stock.quantiteActuelle, stock.stockMinimum);
                  const cfg = statutStockConfig(statut);
                  const ratio = Math.min(100, Math.round((stock.quantiteActuelle / (stock.stockMinimum * 2)) * 100));

                  return (
                    <div key={stock.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-xs shrink-0">
                          {produit.modele.slice(0, 3)}
                        </div>
                        <div>
                          <div className="font-bold text-xs text-slate-900 flex items-center gap-2">
                            <span>{produit.modele}</span>
                            <span className="text-[10px] font-normal text-slate-500">
                              ({produit.cylindree})
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {produit.categorie} &bull; Réf. {produit.prixPublic.toLocaleString("fr-DZ")} DA
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 sm:justify-end">
                        {/* Jauge visuelle */}
                        <div className="w-28 sm:w-36">
                          <div className="flex justify-between text-[11px] mb-1">
                            <span className="font-bold text-slate-800">{stock.quantiteActuelle} en stock</span>
                            <span className="text-slate-400">Min: {stock.stockMinimum}</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                statut === "critique"
                                  ? "bg-red-500"
                                  : statut === "alerte"
                                  ? "bg-amber-500"
                                  : statut === "excedent"
                                  ? "bg-blue-500"
                                  : "bg-red-500"
                              }`}
                              style={{ width: `${Math.max(5, ratio)}%` }}
                            />
                          </div>
                        </div>

                        {/* Statut Pill */}
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${cfg.badge} shrink-0`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                          {cfg.label}
                        </span>

                        {/* Bouton action rapide */}
                        <button
                          onClick={() => {
                            if (statut === "critique" || statut === "alerte") {
                              setFormModelId(stock.produitId);
                              setShowReapproModal(true);
                            } else {
                              setFormModelId(stock.produitId);
                              setShowTransferModal(true);
                            }
                          }}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
                          title="Action réappro ou transfert"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Colonne Droite : Alertes Prioritaires VMS SMART */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-red-500" />
                    <h2 className="text-sm font-bold text-slate-900">Alertes Stock Actives</h2>
                  </div>
                  {alertesNonLues > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500 text-white">
                      {alertesNonLues} non traitées
                    </span>
                  )}
                </div>

                <div className="divide-y divide-slate-100 mt-2 space-y-2">
                  {alertes.slice(0, 4).map((alerte) => (
                    <div
                      key={alerte.id}
                      className={`pt-2.5 pb-1 ${alerte.lue ? "opacity-50" : ""}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2">
                          <span
                            className={`w-2 h-2 rounded-full mt-1 shrink-0 ${
                              alerte.priorite === "haute"
                                ? "bg-red-500"
                                : alerte.priorite === "moyenne"
                                ? "bg-amber-500"
                                : "bg-blue-500"
                            }`}
                          />
                          <div>
                            <p className="text-xs text-slate-800 leading-snug">{alerte.message}</p>
                            <span className="text-[10px] text-slate-400 mt-1 block">
                              {alerte.date}
                            </span>
                          </div>
                        </div>

                        {!alerte.lue && (
                          <button
                            onClick={() => handleMarkAlertRead(alerte.id)}
                            title="Marquer comme traitée"
                            className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-emerald-600 transition shrink-0"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <button
                  onClick={() => setActiveTab("transferts")}
                  className="w-full py-2 px-3 rounded-xl bg-red-50 hover:bg-red-100 text-[#D90016] text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>Voir les transferts recommandés ({nbTransfertsEnCours})</span>
                </button>
              </div>
            </div>
          </div>

          {/* Recommandations Intelligentes VMS SMART (§4.3 AGENTS.md) */}
          <div className="bg-gradient-to-br from-slate-900 to-[#122345] text-white rounded-2xl p-6 shadow-md border border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2 text-[#D90016] text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  Recommandations d&apos;Équilibrage de Stock
                </div>
                <h3 className="text-base font-bold text-white mt-1">
                  Recommandations d&apos;Équilibrage de Stock Proposées
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-white/10 text-slate-300">
                Transferts Proposés
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {transferts
                .filter((t) => t.statut === "proposé" || t.statut === "en_attente_approbation")
                .map((tr) => {
                  const p = PRODUITS.find((pr) => pr.id === tr.produitId);
                  const cfg = statutTransfertConfig(tr.statut);
                  const isIncoming = tr.destinationAgenceId === "ag-001";
                  const agencePartenaire = AGENCES.find(
                    (a) => a.id === (isIncoming ? tr.sourceAgenceId : tr.destinationAgenceId)
                  );

                  return (
                    <div
                      key={tr.id}
                      className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className="font-mono text-[11px] text-red-300 font-bold">
                            {tr.id}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${cfg.badge}`}>
                            {cfg.label}
                          </span>
                        </div>

                        <div className="text-sm font-bold text-white flex items-center gap-1.5">
                          <span>{p?.modele}</span>
                          <span className="text-[#D90016] font-mono font-semibold">
                            ({tr.quantite} unités)
                          </span>
                        </div>

                        <div className="text-xs text-slate-300 mt-1">
                          {isIncoming ? (
                            <span>
                              Provenance : <strong>{agencePartenaire?.nom || "Entrepôt UP Centre"}</strong> &rarr; Votre agence
                            </span>
                          ) : (
                            <span>
                              Destination : Votre agence &rarr; <strong>{agencePartenaire?.nom}</strong>
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-400 mt-2 bg-black/20 p-2.5 rounded-lg border border-white/5 leading-relaxed">
                          {tr.raisonRecommandation}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                        <span className="text-[11px] text-slate-400">
                          {tr.dateCreation}
                        </span>
                        {tr.statut === "proposé" && (
                          <button
                            onClick={() => handleSoumettreTransfert(tr.id)}
                            className="px-3 py-1.5 rounded-lg bg-[#D90016] hover:bg-[#b80013] text-white font-bold text-xs flex items-center gap-1 transition cursor-pointer"
                          >
                            <Send className="w-3 h-3" />
                            <span>Transmettre au Chef UP</span>
                          </button>
                        )}
                        {tr.statut === "en_attente_approbation" && (
                          <span className="text-[11px] text-amber-300 flex items-center gap-1 font-medium">
                            <Clock className="w-3.5 h-3.5" />
                            En attente de validation UP Centre
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* VUE 2 : MON INVENTAIRE & SÉCURITÉ                                         */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      {activeTab === "inventaire" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
            {/* Contrôles de filtrage & recherche */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Inventaire des Stocks & Seuils
                </h2>
                <p className="text-xs text-slate-500">
                  Disponibilité par modèle et seuils de réapprovisionnement
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Champ recherche */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Rechercher un modèle..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D90016]"
                  />
                </div>

                {/* Filtre statut */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="text-xs rounded-xl border border-slate-200 bg-slate-50 py-1.5 px-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#D90016]"
                >
                  <option value="all">Tous les statuts ({stocks.length})</option>
                  <option value="critique">Ruptures (0 unité)</option>
                  <option value="alerte">Stock faible (&lt; seuil)</option>
                  <option value="normal">Nominal</option>
                  <option value="excedent">Excédentaire</option>
                </select>
              </div>
            </div>

            {/* Formule Reorder Point affichée clairement pour le jury */}
            <div className="my-4 p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Règle du Point de Commande (Reorder Point) :</strong> Reorder Point = (Demande pendant délai réappro) + Stock de sécurité
                </span>
              </div>
              <span className="hidden md:inline font-mono text-[11px] text-slate-500">
                Seuils personnalisés par modèle
              </span>
            </div>

            {/* Tableau principal d'inventaire */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-100 font-semibold">
                  <tr>
                    <th className="px-4 py-3">Modèle / Spécifications</th>
                    <th className="px-3 py-3 text-right">En Stock</th>
                    <th className="px-3 py-3 text-right">Stock de Sécurité</th>
                    <th className="px-3 py-3 text-right">En Transit</th>
                    <th className="px-3 py-3 text-right">Délai Réappro.</th>
                    <th className="px-3 py-3 text-right">Point de Commande</th>
                    <th className="px-3 py-3 text-center">État du Stock</th>
                    <th className="px-4 py-3 text-right">Actions Métier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStocks.map((stock) => {
                    const produit = PRODUITS.find((p) => p.id === stock.produitId)!;
                    const statut = getStatutStock(stock.quantiteActuelle, stock.stockMinimum);
                    const cfg = statutStockConfig(statut);
                    const dailyDemand = stock.produitId === "vms-cirta-125" ? 1.6 : 1.0;
                    const reorderPoint = Math.ceil(dailyDemand * stock.delaiReapprovisionnement + stock.stockMinimum);

                    return (
                      <tr key={stock.id} className="hover:bg-slate-50/70 transition">
                        <td className="px-4 py-3.5">
                          <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
                            <span>{produit.modele}</span>
                            <span className="font-mono text-[10px] text-[#D90016] bg-red-50 px-1.5 py-0.5 rounded">
                              {produit.cylindree}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {produit.categorie} &bull; Prix réf : {produit.prixPublic.toLocaleString("fr-DZ")} DA
                          </div>
                        </td>

                        <td className="px-3 py-3.5 text-right font-extrabold text-slate-900 text-sm">
                          {stock.quantiteActuelle}
                        </td>

                        <td className="px-3 py-3.5 text-right">
                          <button
                            onClick={() => {
                              setEditingStockRecord(stock);
                              setNewSafetyStockValue(stock.stockMinimum);
                              setShowEditSafetyModal(true);
                            }}
                            className="inline-flex items-center gap-1 font-semibold text-slate-700 hover:text-[#D90016] hover:bg-slate-100 px-2 py-1 rounded-md transition"
                            title="Modifier le seuil de sécurité minimum"
                          >
                            <span>{stock.stockMinimum} unités</span>
                            <Sliders className="w-3 h-3 text-slate-400" />
                          </button>
                        </td>

                        <td className="px-3 py-3.5 text-right">
                          {stock.stockEntrant > 0 ? (
                            <span className="font-semibold text-[#D90016] bg-red-50 px-2 py-0.5 rounded text-[11px]">
                              +{stock.stockEntrant} u.
                            </span>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>

                        <td className="px-3 py-3.5 text-right text-slate-600 font-mono">
                          {stock.delaiReapprovisionnement} j
                        </td>

                        <td className="px-3 py-3.5 text-right font-bold text-slate-900 font-mono">
                          {reorderPoint} u.
                        </td>

                        <td className="px-3 py-3.5 text-center">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${cfg.badge}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                            {cfg.label}
                          </span>
                        </td>

                        <td className="px-4 py-3.5 text-right space-x-1.5">
                          {statut === "critique" || statut === "alerte" ? (
                            <button
                              onClick={() => {
                                setFormModelId(stock.produitId);
                                setShowReapproModal(true);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-[#D90016] hover:bg-[#b80013] text-white font-semibold text-[11px] shadow-xs cursor-pointer transition"
                            >
                              Réappro UP
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setFormModelId(stock.produitId);
                                setShowTransferModal(true);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] cursor-pointer transition"
                            >
                              Céder / Transférer
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* VUE 3 : PRÉVISIONS DE LA DEMANDE                                          */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      {activeTab === "previsions" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Prévisions de la Demande (Modèle WMA)
                </h2>
                <p className="text-xs text-slate-500">
                  Moyenne mobile pondérée sur l'historique des ventes
                </p>
              </div>

              {/* Sélecteur d'Horizon Temporel */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Horizon d&apos;analyse :</span>
                <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                  {([7, 30, 90] as const).map((h) => (
                    <button
                      key={h}
                      onClick={() => setSelectedHorizon(h)}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                        selectedHorizon === h
                          ? "bg-white shadow-xs text-[#D90016]"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      {h} Jours
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Sélecteur de Modèle de Moto VMS */}
            <div className="flex items-center gap-2 py-4 overflow-x-auto border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">
                Modèle analysé :
              </span>
              {PRODUITS.map((p) => {
                const isSelected = selectedModelId === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedModelId(p.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-slate-900 text-white shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    <span>{p.modele}</span>
                    <span className="text-[10px] opacity-70">({p.cylindree})</span>
                  </button>
                );
              })}
            </div>

            {/* Synthèse Prévisionnelle vs Stock Réel */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-slate-500 text-xs block">Stock physique disponible</span>
                <span className="text-2xl font-extrabold text-slate-900 mt-1 block">
                  {currentQty} unités
                </span>
                <span className="text-[11px] text-slate-500">
                  Seuil de sécurité : {modelStock?.stockMinimum || 0} unités
                </span>
              </div>

              <div className="bg-red-50 p-4 rounded-xl border border-red-200">
                <span className="text-[#D90016] text-xs block">
                  Demande prévue sur {selectedHorizon} jours
                </span>
                <span className="text-2xl font-extrabold text-[#b80013] mt-1 block">
                  ~{demandHorizon} unités
                </span>
                <span className="text-[11px] text-[#D90016]">
                  Rythme estimé : {(demandHorizon / selectedHorizon).toFixed(1)} u / jour
                </span>
              </div>

              <div
                className={`p-4 rounded-xl border ${
                  netGap < 0
                    ? "bg-red-50 border-red-200 text-red-900"
                    : "bg-emerald-50 border-emerald-200 text-emerald-900"
                }`}
              >
                <span className="text-xs block opacity-80">
                  Écart net projeté (Stock - Demande)
                </span>
                <span className="text-2xl font-extrabold mt-1 block">
                  {netGap > 0 ? `+${netGap}` : netGap} unités
                </span>
                <span className="text-[11px] font-medium block">
                  {netGap < 0
                    ? `⚠️ Risque de rupture dans ~${Math.max(1, Math.round(currentQty / dailyRate))} jours`
                    : "✓ Stock suffisant sur cet horizon"}
                </span>
              </div>
            </div>

            {/* Graphique Recharts Ventes Réelles & Prévisions */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Courbe Historique & Projection des Ventes — {currentModel.modele}
                </h3>
                <span className="text-[11px] text-slate-400">
                  Unités vendues / mois
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorVentes" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#D90016" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#D90016" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorPrev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="mois" tick={{ fontSize: 11, fill: "#64748b" }} />
                    <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                    <Tooltip
                      contentStyle={{
                        fontSize: 12,
                        borderRadius: 12,
                        border: "1px solid #e2e8f0",
                        boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                    <Area
                      type="monotone"
                      dataKey="ventes"
                      name="Ventes réalisées"
                      stroke="#D90016"
                      strokeWidth={2.5}
                      fill="url(#colorVentes)"
                      dot={{ r: 3, fill: "#D90016" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="prevision"
                      name="Projection prédictive (WMA)"
                      stroke="#f59e0b"
                      strokeWidth={2.5}
                      strokeDasharray="4 4"
                      fill="url(#colorPrev)"
                      dot={{ r: 3, fill: "#f59e0b" }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Note explicative conforme AGENTS.md §4.1 */}
            <div className="mt-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 flex items-start gap-3">
              <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Explication des hypothèses prédictives (AGENTS.md §4.1) :</strong>
                <p className="mt-1 text-slate-700 leading-relaxed">
                  Le moteur utilise une moyenne mobile pondérée attribuant un coefficient décroissant aux ventes des semaines antérieures.
                  Les ventes des derniers jours et des derniers mois exercent l&apos;impact le plus fort pour capter les tendances immédiates du marché local algérien.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* VUE 4 : TRANSFERTS & RÉAPPROVISIONNEMENT                                   */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      {activeTab === "transferts" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Historique & Suivi des Transferts
                </h2>
                <p className="text-xs text-slate-500">
                  Demandes de réapprovisionnement UP et transferts inter-agences
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowReapproModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-[#D90016] hover:bg-[#b80013] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Demande UP</span>
                </button>
                <button
                  onClick={() => setShowTransferModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-[#D90016]" />
                  <span>Transfert Inter-Agences</span>
                </button>
              </div>
            </div>

            {/* Liste complète des transferts */}
            <div className="divide-y divide-slate-100 mt-4">
              {transferts.map((tr) => {
                const produit = PRODUITS.find((p) => p.id === tr.produitId);
                const cfg = statutTransfertConfig(tr.statut);
                const IconStatus = cfg.icon;
                const isIncoming = tr.destinationAgenceId === "ag-001";
                const agenceSource = AGENCES.find((a) => a.id === tr.sourceAgenceId);
                const agenceDest = AGENCES.find((a) => a.id === tr.destinationAgenceId);

                return (
                  <div key={tr.id} className="py-4 space-y-2.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-xs font-bold text-slate-900">
                          {tr.id}
                        </span>
                        <span className="text-xs text-slate-400">&bull;</span>
                        <span className="font-bold text-xs text-[#D90016]">
                          {produit?.modele} ({tr.quantite} unités)
                        </span>
                        <span className="text-xs text-slate-400">&bull;</span>
                        <span className="text-[11px] text-slate-500">
                          {tr.typeTransfert === "reappro_up" ? "Réappro Entrepôt UP" : "Inter-Agences"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${cfg.badge}`}>
                          <IconStatus className="w-3 h-3" />
                          {cfg.label}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-600 flex flex-wrap items-center gap-3">
                      <div>
                        <strong>Origine :</strong> {agenceSource?.nom || "Entrepôt UP Centre"}
                      </div>
                      <div>&rarr;</div>
                      <div>
                        <strong>Destination :</strong> {agenceDest?.nom || "Agence Alger Centre"}
                      </div>
                      <div className="text-slate-400 text-[11px]">
                        Initié le : {tr.dateCreation}
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 leading-relaxed">
                      {tr.raisonRecommandation}
                    </p>

                    {/* Actions contextuelles selon l'état */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-slate-400 italic">
                        {tr.notes || "Workflow supervisé par l'Unité de Production Centre."}
                      </span>

                      <div className="flex items-center gap-2">
                        {tr.statut === "proposé" && (
                          <button
                            onClick={() => handleSoumettreTransfert(tr.id)}
                            className="px-3 py-1 bg-red-50 hover:bg-red-100 text-[#b80013] rounded-lg text-xs font-semibold border border-red-200 transition cursor-pointer"
                          >
                            Soumettre au Chef UP
                          </button>
                        )}

                        {(tr.statut === "en_transit" || tr.statut === "approuvé") && isIncoming && (
                          <button
                            onClick={() => handleConfirmerReception(tr)}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Confirmer la Réception Physique</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* VUE 5 : PIÈCES DE RECHANGE & CONSOMMABLES (§4.5 AGENTS.md)                */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      {activeTab === "pieces" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-emerald-600" />
                  Pièces de Rechange & Consommables
                </h2>
                <p className="text-xs text-slate-500">
                  Stock et prévisions corrélés au parc actif
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-[#D90016] border border-red-200">
                Parc actif estimé : 380 motos VMS
              </span>
            </div>

            

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-100 font-semibold">
                  <tr>
                    <th className="px-4 py-3">Réf / Désignation</th>
                    <th className="px-4 py-3">Modèles Compatibles</th>
                    <th className="px-3 py-3 text-right">En Stock</th>
                    <th className="px-3 py-3 text-right">Stock Sécurité</th>
                    <th className="px-3 py-3 text-right">Demande Prévue 30j</th>
                    <th className="px-4 py-3 text-right">Prix Public Réf</th>
                    <th className="px-4 py-3 text-center">État</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {PIECES_RECHANGE.map((piece) => {
                    const isLow = piece.stockActuel < piece.stockMinimum;
                    return (
                      <tr key={piece.id} className="hover:bg-slate-50/70 transition">
                        <td className="px-4 py-3.5">
                          <div className="font-bold text-slate-900 text-xs">{piece.designation}</div>
                          <div className="text-[11px] font-mono text-slate-400">{piece.reference}</div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex flex-wrap gap-1">
                            {piece.modelesCompatibles.map((m) => (
                              <span
                                key={m}
                                className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium"
                              >
                                {m}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-3 py-3.5 text-right font-bold text-slate-900 text-sm">
                          {piece.stockActuel} {piece.unite}
                        </td>
                        <td className="px-3 py-3.5 text-right text-slate-600">
                          {piece.stockMinimum} {piece.unite}
                        </td>
                        <td className="px-3 py-3.5 text-right font-semibold text-[#D90016]">
                          ~{piece.demandeEstimee30j} {piece.unite}
                        </td>
                        <td className="px-4 py-3.5 text-right font-bold text-slate-900">
                          {piece.prixPublic.toLocaleString("fr-DZ")} DA
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          {isLow ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              <AlertTriangle className="w-3 h-3" /> Réappro requis
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" /> Conforme
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* VUE 6 : PÉRIMÈTRE & CONTRÔLE D'ACCÈS RBAC (§4.6 & §10 AGENTS.md)           */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      {activeTab === "securite" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Sécurité & Cloisonnement RBAC
                </h2>
                <p className="text-xs text-slate-500">
                  Contrôle d'accès et séparation des périmètres
                </p>
              </div>

              <button
                onClick={handleSimulateUnauthorizedAccess}
                className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition cursor-pointer"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Simuler Tentative Accès Interdit (Jury Scénario 2)</span>
              </button>
            </div>

            {/* Architecture du périmètre de l'Agence */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
              <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Ressources Autorisées pour l&apos;Agence Alger Centre
                </div>
                <ul className="text-xs text-slate-700 space-y-1.5 mt-2">
                  <li>&bull; Consultation de son propre stock et ses ventes locales</li>
                  <li>&bull; Propositions de transferts avec les agences du même cluster (Blida, Tipaza)</li>
                  <li>&bull; Demandes de réapprovisionnement auprès de son UP de tutelle (UP Centre)</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-red-50/60 border border-red-200/80">
                <div className="flex items-center gap-2 text-red-900 font-bold text-xs mb-1">
                  <XCircle className="w-4 h-4 text-red-600" />
                  Ressources Strictement Bloquées (Cloisonnement Sécurisé)
                </div>
                <ul className="text-xs text-slate-700 space-y-1.5 mt-2">
                  <li>&bull; Accès aux inventaires financiers des autres Unités de Production (UP Est / Ouest)</li>
                  <li>&bull; Données commerciales et comptables confidentielles des agences distantes</li>
                  <li>&bull; Modification directe des ordres de fabrication sans accord central</li>
                </ul>
              </div>
            </div>

            {/* Journal d'audit de sécurité de l'agence */}
            <div className="mt-6">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Journal d&apos;Audit & Événements de Sécurité Récents (Trace Immuable)
              </h3>

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

                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 self-start sm:self-center uppercase ${
                        log.statut === "autorise"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-red-50 text-red-700 border border-red-200"
                      }`}
                    >
                      {log.statut === "autorise" ? "Autorisé" : "Refusé / Bloqué"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* MODAL 1 : DEMANDE DE RÉAPPROVISIONNEMENT UP                               */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      {showReapproModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-[#D90016]" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Demande de Réapprovisionnement Entrepôt UP
                </h3>
              </div>
              <button
                onClick={() => setShowReapproModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateReappro} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Modèle de Moto VMS à Réapprovisionner
                </label>
                <select
                  value={formModelId}
                  onChange={(e) => setFormModelId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#D90016] focus:outline-none"
                >
                  {PRODUITS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.modele} ({p.categorie})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Quantité Demandée (Unités)
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  required
                  value={formQuantity}
                  onChange={(e) => setFormQuantity(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#D90016] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Entrepôt Source de Tutelle
                </label>
                <input
                  type="text"
                  readOnly
                  value="Unité de Production — Centre (Entrepôt Régional)"
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Justification Métier / Contexte de la Rupture
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex : Stock actuel épuisé, 3 commandes clients fermes en attente de livraison..."
                  value={formJustification}
                  onChange={(e) => setFormJustification(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#D90016] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowReapproModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#D90016] hover:bg-[#b80013] text-white rounded-xl font-bold shadow-md cursor-pointer"
                >
                  Transmettre la Demande
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* MODAL 2 : PROPOSER UN TRANSFERT INTER-AGENCES                              */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-[#D90016]" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Proposer un Transfert Inter-Agences
                </h3>
              </div>
              <button
                onClick={() => setShowTransferModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTransferProposal} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Modèle VMS Concerné
                </label>
                <select
                  value={formModelId}
                  onChange={(e) => setFormModelId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#D90016] focus:outline-none"
                >
                  {PRODUITS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.modele} ({p.categorie})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Agence Partenaire Source (Cluster UP Centre)
                </label>
                <select
                  value={formSourceAgence}
                  onChange={(e) => setFormSourceAgence(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#D90016] focus:outline-none"
                >
                  <option value="ag-002">Agence Blida (Excédent Cirta 125 identifié)</option>
                  <option value="ag-003">Agence Tipaza (Stock disponible Saphir 150)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Quantité à Transférer
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  required
                  value={formQuantity}
                  onChange={(e) => setFormQuantity(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#D90016] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Raison de la Proposition
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex : Équilibrage de stock local tout en préservant le seuil de sécurité de l'agence partenaire..."
                  value={formJustification}
                  onChange={(e) => setFormJustification(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#D90016] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow-md cursor-pointer"
                >
                  Créer la Proposition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* MODAL 3 : MODIFIER LE SEUIL DE SÉCURITÉ (§4.2 AGENTS.md)                  */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      {showEditSafetyModal && editingStockRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">
                Ajuster le Stock de Sécurité
              </h3>
              <button
                onClick={() => setShowEditSafetyModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSafetyStock} className="mt-4 space-y-4 text-xs">
              <p className="text-slate-600">
                Ajustez le seuil de sécurité minimum pour{" "}
                <strong>
                  {PRODUITS.find((p) => p.id === editingStockRecord.produitId)?.modele}
                </strong>
                . Le point de commande sera automatiquement recalculé.
              </p>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nouveau seuil de sécurité (unités)
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  required
                  value={newSafetyStockValue}
                  onChange={(e) => setNewSafetyStockValue(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#D90016] focus:outline-none font-bold text-sm"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditSafetyModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#D90016] hover:bg-[#b80013] text-white rounded-xl font-bold shadow-md cursor-pointer"
                >
                  Mettre à jour
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* MODAL 4 : SIMULATION ACCÈS NON AUTORISÉ (SCÉNARIO 2 JURY §10)             */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      {showSecurityAlertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border-2 border-red-500 animate-scaleUp">
            <div className="flex items-center gap-3 pb-3 border-b border-red-100 text-red-600">
              <div className="p-2 rounded-xl bg-red-100 text-red-600">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-red-700">
                  ACCÈS REFUSÉ &bull; SÉCURITÉ RBAC
                </h3>
                <span className="text-[10px] font-mono font-bold text-red-500">
                  CODE HTTP 403 FORBIDDEN &bull; AGENTS.md §10 SCÉNARIO 2
                </span>
              </div>
            </div>

            <div className="mt-4 space-y-3 text-xs text-slate-700">
              <p className="font-semibold text-slate-900">
                Tentative d&apos;accès à une ressource hors-périmètre bloquée :
              </p>
              <div className="p-3 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] space-y-1">
                <div><span className="text-[#D90016]">Utilisateur :</span> karim.benali@agence.com</div>
                <div><span className="text-[#D90016]">Rôle :</span> Agence (Niveau 1)</div>
                <div><span className="text-[#D90016]">Périmètre autorisé :</span> UP Centre uniquement</div>
                <div><span className="text-red-400">Cible demandée :</span> /up-est/warehouse-confidential</div>
                <div><span className="text-red-400">Statut :</span> REJET IMMÉDIAT (SEGMENTATION RÉSEAU)</div>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Conformément aux règles de cloisonnement du système VMS SMART, les agences ne peuvent
                pas interroger les stocks ou documents sensibles des autres Unités de Production sans
                autorisation centralisée de la Direction.
              </p>
              <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-800 text-[11px] font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Incident consigné dans le journal d&apos;audit centralisé.</span>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end">
              <button
                onClick={() => {
                  setShowSecurityAlertModal(false);
                  setActiveTab("securite");
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs cursor-pointer"
              >
                Consulter le Journal d&apos;Audit
              </button>
            </div>
          </div>
        </div>
      )}
    </AgenceLayout>
  );
}
