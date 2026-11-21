"use client";

import React, { useState } from "react";
import AgenceLayout from "@/components/AgenceLayout";
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
  HISTORIQUE_VENTES,
  PREVISIONS_FUTURES,
  AGENCES,
} from "@/lib/data";
import type { StatutStock, StatutTransfert, DemandeTransfert } from "@/lib/types";
import Link from "next/link";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function statutStockConfig(statut: StatutStock) {
  const map = {
    critique: {
      label: "Rupture",
      dot: "bg-red-500",
      badge: "bg-red-50 text-red-700 border-red-200",
      ring: "border-l-red-500",
    },
    alerte: {
      label: "Stock faible",
      dot: "bg-amber-500",
      badge: "bg-amber-50 text-amber-700 border-amber-200",
      ring: "border-l-amber-500",
    },
    normal: {
      label: "Normal",
      dot: "bg-emerald-500",
      badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
      ring: "border-l-emerald-500",
    },
    excedent: {
      label: "Excédent",
      dot: "bg-blue-500",
      badge: "bg-blue-50 text-blue-700 border-blue-200",
      ring: "border-l-blue-500",
    },
  };
  return map[statut];
}

function statutTransfertConfig(statut: StatutTransfert) {
  const map: Record<StatutTransfert, { label: string; badge: string; icon: React.ReactNode }> = {
    proposé: {
      label: "Proposé",
      badge: "bg-slate-100 text-slate-700 border-slate-200",
      icon: <Info className="w-3 h-3" />,
    },
    en_attente_approbation: {
      label: "En attente",
      badge: "bg-amber-50 text-amber-700 border-amber-200",
      icon: <Clock className="w-3 h-3" />,
    },
    approuvé: {
      label: "Approuvé",
      badge: "bg-teal-50 text-teal-700 border-teal-200",
      icon: <CheckCircle2 className="w-3 h-3" />,
    },
    rejeté: {
      label: "Rejeté",
      badge: "bg-red-50 text-red-700 border-red-200",
      icon: <XCircle className="w-3 h-3" />,
    },
    en_transit: {
      label: "En transit",
      badge: "bg-blue-50 text-blue-700 border-blue-200",
      icon: <ArrowRightLeft className="w-3 h-3" />,
    },
    terminé: {
      label: "Terminé",
      badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: <CheckCircle2 className="w-3 h-3" />,
    },
    annulé: {
      label: "Annulé",
      badge: "bg-slate-100 text-slate-500 border-slate-200",
      icon: <XCircle className="w-3 h-3" />,
    },
  };
  return map[statut];
}

function nomProduit(id: string) {
  return PRODUITS.find((p) => p.id === id)?.modele ?? id;
}
function nomAgence(id: string) {
  return AGENCES.find((a) => a.id === id)?.nom ?? id;
}

// ─── Données graphique — fusion historique + prévisions ──────────────────────
const DONNEES_GRAPHIQUE = [
  ...HISTORIQUE_VENTES,
  ...PREVISIONS_FUTURES,
];

// ─── Composant principal ──────────────────────────────────────────────────────
export default function AgenceDashboard() {
  const [horizonPrevision, setHorizonPrevision] = useState<7 | 30 | 90>(30);
  const alertesNonLues = ALERTES.filter((a) => !a.lue).length;

  // Calcul des KPIs résumés
  const nbRuptures = STOCKS_AG001.filter((s) => s.quantiteActuelle === 0).length;
  const nbFaibles = STOCKS_AG001.filter(
    (s) => s.quantiteActuelle > 0 && s.quantiteActuelle < s.stockMinimum
  ).length;
  const nbTransfertsEnAttente = TRANSFERTS.filter(
    (t) => t.statut === "en_attente_approbation" || t.statut === "proposé"
  ).length;
  const totalMotosDispo = STOCKS_AG001.reduce((a, s) => a + s.quantiteActuelle, 0);

  return (
    <AgenceLayout alertesNonLues={alertesNonLues}>
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* ── En-tête de section ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Tableau de bord — Agence Alger Centre
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Wilaya d'Alger · Unité de Production Centre · Données au 21 Nov 2026
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full font-medium">
              ⚠ Données simulées — démo
            </span>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-slate-200 bg-white rounded-lg text-slate-600 hover:bg-slate-50 transition">
              <RefreshCw className="w-3.5 h-3.5" />
              Actualiser
            </button>
          </div>
        </div>

        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Motos disponibles */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-500">Motos disponibles</span>
              <span className="p-1.5 bg-teal-50 rounded-lg">
                <Package className="w-4 h-4 text-teal-600" />
              </span>
            </div>
            <div className="text-2xl font-bold text-slate-900">{totalMotosDispo}</div>
            <div className="text-[11px] text-slate-500 mt-1">
              Tous modèles confondus
            </div>
          </div>

          {/* Ruptures */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-500">Ruptures de stock</span>
              <span className="p-1.5 bg-red-50 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-red-500" />
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <div className="text-2xl font-bold text-red-600">{nbRuptures}</div>
              <div className="text-xs text-amber-600 font-medium">{nbFaibles} en alerte</div>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Modèles nécessitant une action
            </div>
          </div>

          {/* Prévision */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-500">Demande prévue (30 j)</span>
              <span className="p-1.5 bg-blue-50 rounded-lg">
                <TrendingUp className="w-4 h-4 text-blue-600" />
              </span>
            </div>
            <div className="text-2xl font-bold text-slate-900">28</div>
            <div className="text-[11px] text-slate-500 mt-1">
              Moyenne mobile pondérée — simulée
            </div>
          </div>

          {/* Transferts en cours */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-500">Transferts en cours</span>
              <span className="p-1.5 bg-amber-50 rounded-lg">
                <ArrowRightLeft className="w-4 h-4 text-amber-600" />
              </span>
            </div>
            <div className="text-2xl font-bold text-slate-900">{nbTransfertsEnAttente}</div>
            <div className="text-[11px] text-slate-500 mt-1">
              En attente d'approbation
            </div>
          </div>
        </div>

        {/* ── Alertes + Inventaire rapide ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Alertes stock */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-red-500" />
                <h2 className="text-sm font-bold text-slate-900">Alertes Stock</h2>
                {alertesNonLues > 0 && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-500 text-white">
                    {alertesNonLues}
                  </span>
                )}
              </div>
              <Link href="/agence/alertes" className="text-xs text-teal-600 hover:underline">
                Toutes
              </Link>
            </div>
            <div className="divide-y divide-slate-50">
              {ALERTES.slice(0, 4).map((alerte) => (
                <div
                  key={alerte.id}
                  className={`px-4 py-3 flex items-start gap-3 border-l-4 ${
                    alerte.priorite === "haute"
                      ? "border-l-red-500"
                      : alerte.priorite === "moyenne"
                      ? "border-l-amber-400"
                      : "border-l-slate-200"
                  } ${alerte.lue ? "opacity-60" : ""}`}
                >
                  <div className="mt-0.5 shrink-0">
                    {alerte.type === "rupture_imminente" && (
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                    )}
                    {alerte.type === "stock_faible" && (
                      <TrendingDown className="w-4 h-4 text-amber-500" />
                    )}
                    {alerte.type === "recommandation_transfert" && (
                      <ArrowRightLeft className="w-4 h-4 text-teal-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-700 leading-relaxed">{alerte.message}</p>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">{alerte.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Inventaire rapide par modèle */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-slate-600" />
                <h2 className="text-sm font-bold text-slate-900">Stock par Modèle</h2>
              </div>
              <Link href="/agence/inventaire" className="text-xs text-teal-600 hover:underline">
                Inventaire complet →
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-2.5">Modèle</th>
                    <th className="px-4 py-2.5 text-right">En stock</th>
                    <th className="px-4 py-2.5 text-right">Stock min.</th>
                    <th className="px-4 py-2.5 text-right">En transit</th>
                    <th className="px-4 py-2.5 text-center">Statut</th>
                    <th className="px-4 py-2.5 text-right">Prévision 30 j</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {STOCKS_AG001.map((stock) => {
                    const produit = PRODUITS.find((p) => p.id === stock.produitId)!;
                    let statut: StatutStock;
                    if (stock.quantiteActuelle === 0) statut = "critique";
                    else if (stock.quantiteActuelle < stock.stockMinimum) statut = "alerte";
                    else if (stock.quantiteActuelle > stock.stockMinimum * 3) statut = "excedent";
                    else statut = "normal";
                    const cfg = statutStockConfig(statut);

                    // Prévision simplifiée
                    const prevision30j = Math.round(stock.quantiteActuelle * 2.1 + 5);

                    return (
                      <tr key={stock.id} className="hover:bg-slate-50/60 transition">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-900">{produit.modele}</div>
                          <div className="text-[11px] text-slate-400">{produit.categorie}</div>
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-slate-900">
                          {stock.quantiteActuelle}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-500">
                          {stock.stockMinimum}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {stock.stockEntrant > 0 ? (
                            <span className="text-teal-600 font-medium">
                              +{stock.stockEntrant}
                            </span>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${cfg.badge}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-slate-600 font-medium">
                          {prevision30j}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ── Graphique prévisions + Transferts recommandés ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Graphique Ventes historiques & prévisions */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Ventes historiques & Prévisions
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Méthode : Moyenne mobile pondérée — données simulées
                </p>
              </div>
              {/* Sélecteur horizon */}
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
                {([7, 30, 90] as const).map((h) => (
                  <button
                    key={h}
                    onClick={() => setHorizonPrevision(h)}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition ${
                      horizonPrevision === h
                        ? "bg-white shadow text-slate-900"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {h} j
                  </button>
                ))}
              </div>
            </div>

            <ResponsiveContainer width="100%" height={220}>
              <AreaChart
                data={DONNEES_GRAPHIQUE}
                margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="gVentes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gPrev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="mois"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    fontSize: 12,
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 4px 6px -1px rgba(0,0,0,.1)",
                  }}
                  labelStyle={{ fontWeight: 600 }}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                />
                <Area
                  type="monotone"
                  dataKey="ventes"
                  name="Ventes réelles"
                  stroke="#0d9488"
                  strokeWidth={2}
                  fill="url(#gVentes)"
                  dot={{ r: 3, fill: "#0d9488" }}
                  activeDot={{ r: 5 }}
                />
                <Area
                  type="monotone"
                  dataKey="prevision"
                  name="Prévision (simulée)"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  strokeDasharray="5 3"
                  fill="url(#gPrev)"
                  dot={{ r: 3, fill: "#f59e0b" }}
                  activeDot={{ r: 5 }}
                />
              </AreaChart>
            </ResponsiveContainer>

            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-700">
              <strong>Hypothèse de prévision :</strong> Moyenne mobile pondérée sur 7 jours —
              les données récentes ont un poids plus élevé. Les prévisions sont indicatives et
              doivent être validées par le responsable d'agence.
            </div>
          </div>

          {/* Transferts recommandés */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-teal-600" />
                <h2 className="text-sm font-bold text-slate-900">Transferts</h2>
              </div>
              <Link href="/agence/transferts" className="text-xs text-teal-600 hover:underline">
                Tous →
              </Link>
            </div>

            <div className="divide-y divide-slate-50 max-h-[320px] overflow-y-auto">
              {TRANSFERTS.map((transfert) => {
                const cfg = statutTransfertConfig(transfert.statut);
                const estEntrant = transfert.destinationAgenceId === "ag-001";
                return (
                  <div key={transfert.id} className="px-4 py-3 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-semibold text-xs text-slate-900">
                          {nomProduit(transfert.produitId)}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {estEntrant ? (
                            <>
                              <span className="text-teal-600">↓ De :</span>{" "}
                              {nomAgence(transfert.sourceAgenceId)}
                            </>
                          ) : (
                            <>
                              <span className="text-amber-600">↑ Vers :</span>{" "}
                              {nomAgence(transfert.destinationAgenceId)}
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-bold text-sm text-slate-900">
                          {transfert.quantite} u.
                        </div>
                        <span
                          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border ${cfg.badge}`}
                        >
                          {cfg.icon}
                          {cfg.label}
                        </span>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      {transfert.raisonRecommandation}
                    </p>
                    {(transfert.statut === "proposé" ||
                      transfert.statut === "en_attente_approbation") && (
                      <button className="w-full py-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition">
                        Soumettre à l'approbation
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Point de Commande & Réapprovisionnement ── */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">
              Analyse de Réapprovisionnement — Point de Commande
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Formule : Point de commande = Demande prévue × Délai de réappro + Stock de sécurité
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-4 py-2.5">Modèle</th>
                  <th className="px-4 py-2.5 text-right">Stock actuel</th>
                  <th className="px-4 py-2.5 text-right">Délai réappro. (j)</th>
                  <th className="px-4 py-2.5 text-right">Dem. prévue / j</th>
                  <th className="px-4 py-2.5 text-right">Stock sécu.</th>
                  <th className="px-4 py-2.5 text-right">Point de commande</th>
                  <th className="px-4 py-2.5 text-right">Stock entrant</th>
                  <th className="px-4 py-2.5 text-center">Recommandation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {STOCKS_AG001.map((stock) => {
                  const produit = PRODUITS.find((p) => p.id === stock.produitId)!;
                  const demJournaliere = 0.9; // simulé
                  const pointCommande = Math.ceil(
                    demJournaliere * stock.delaiReapprovisionnement + stock.stockMinimum
                  );
                  const doitCommander = stock.quantiteActuelle <= pointCommande;

                  return (
                    <tr key={stock.id} className="hover:bg-slate-50/60 transition">
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        {produit.modele}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-slate-900">
                        {stock.quantiteActuelle}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-600">
                        {stock.delaiReapprovisionnement}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-600">
                        ~{demJournaliere}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-600">
                        {stock.stockMinimum}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-900">
                        {pointCommande}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {stock.stockEntrant > 0 ? (
                          <span className="text-teal-600 font-medium">+{stock.stockEntrant}</span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {stock.quantiteActuelle === 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold bg-red-500 text-white">
                            <AlertTriangle className="w-3 h-3" /> Rupture — Action urgente
                          </span>
                        ) : doitCommander ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <TrendingDown className="w-3 h-3" /> Réapprovisionner
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" /> Stock suffisant
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

        {/* ── Catalogue VMS (extrait) ── */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Catalogue Produits VMS</h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Prix de référence publics — Source :{" "}
                <a
                  href="https://www.autobip.com"
                  className="text-teal-600 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  autobip.com
                </a>{" "}
                &{" "}
                <a
                  href="https://motobladi.dz"
                  className="text-teal-600 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  motobladi.dz
                </a>{" "}
                · Jan 2026 — Les prix peuvent ne pas être à jour
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 divide-x divide-slate-100">
            {PRODUITS.map((p) => {
              const stock = STOCKS_AG001.find((s) => s.produitId === p.id);
              return (
                <div key={p.id} className="p-4 hover:bg-slate-50 transition">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center mb-3">
                    <Package className="w-5 h-5 text-slate-400" />
                  </div>
                  <div className="font-semibold text-sm text-slate-900">{p.modele}</div>
                  <div className="text-[11px] text-slate-500">{p.categorie}</div>
                  <div className="text-xs font-bold text-teal-700 mt-1">
                    {p.prixPublic.toLocaleString("fr-DZ")} DA
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Prix public de référence
                  </div>
                  {stock !== undefined && (
                    <div className="mt-2 text-[11px] font-semibold text-slate-700">
                      Stock : {stock.quantiteActuelle} u.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </AgenceLayout>
  );
}
