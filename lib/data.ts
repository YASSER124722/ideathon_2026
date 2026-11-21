// ─── Données synthétiques — DÉMO SIMULÉE ────────────────────────────────────
// AVERTISSEMENT : Toutes les données ci-dessous sont simulées à des fins de
// démonstration. Elles ne représentent pas des données réelles de VMS Industrie.

import type {
  Agence,
  UniteDeProduction,
  Produit,
  StockRecord,
  VenteRecord,
  AlerteStock,
  DemandeTransfert,
  DonneesHistoriques,
} from "./types";

// ─── Catalogue VMS (données publiques de référence) ─────────────────────────
export const PRODUITS: Produit[] = [
  {
    id: "vms-cirta-125",
    modele: "Cirta 125",
    marque: "VMS",
    categorie: "Routière",
    prixPublic: 185_000,
    sourceUrl: "https://www.autobip.com/ar/prix-vms-algerie/81",
    dateSource: "2026-01",
    imageUrl: "/public/image.png",
  },
  {
    id: "vms-clio-125",
    modele: "Clio 125",
    marque: "VMS",
    categorie: "Routière",
    prixPublic: 198_000,
    sourceUrl: "https://motobladi.dz/product-brand/vms/",
    dateSource: "2026-01",
  },
  {
    id: "vms-saphir-150",
    modele: "Saphir 150",
    marque: "VMS",
    categorie: "Sportive",
    prixPublic: 245_000,
    sourceUrl: "https://motobladi.dz/product-brand/vms/",
    dateSource: "2026-01",
  },
  {
    id: "vms-cobra-250",
    modele: "Cobra 250",
    marque: "VMS",
    categorie: "Sport",
    prixPublic: 390_000,
    sourceUrl: "https://motobladi.dz/product-brand/vms/",
    dateSource: "2026-01",
  },
  {
    id: "vms-jumper-150",
    modele: "Jumper 150",
    marque: "VMS",
    categorie: "Utilitaire",
    prixPublic: 220_000,
    sourceUrl: "https://www.autobip.com/ar/prix-vms-algerie/81",
    dateSource: "2026-01",
  },
];

// ─── Unités de Production ────────────────────────────────────────────────────
export const UNITES_PRODUCTION: UniteDeProduction[] = [
  {
    id: "up-centre",
    nom: "Unité de Production — Centre",
    region: "Centre (Alger, Blida, Tipaza)",
    agences: ["ag-001", "ag-002", "ag-003"],
  },
  {
    id: "up-est",
    nom: "Unité de Production — Est",
    region: "Est (Constantine, Annaba, Sétif)",
    agences: ["ag-004", "ag-005"],
  },
];

// ─── Agences ─────────────────────────────────────────────────────────────────
export const AGENCES: Agence[] = [
  {
    id: "ag-001",
    nom: "Agence Alger Centre",
    wilaya: "Alger",
    uniteDeProductionId: "up-centre",
    responsable: "Karim Benali",
    email: "karim.benali@agence.com",
  },
  {
    id: "ag-002",
    nom: "Agence Blida",
    wilaya: "Blida",
    uniteDeProductionId: "up-centre",
    responsable: "Sara Mansouri",
    email: "sara.mansouri@agence.com",
  },
  {
    id: "ag-003",
    nom: "Agence Tipaza",
    wilaya: "Tipaza",
    uniteDeProductionId: "up-centre",
    responsable: "Ahmed Zidane",
    email: "ahmed.zidane@agence.com",
  },
  {
    id: "ag-004",
    nom: "Agence Constantine",
    wilaya: "Constantine",
    uniteDeProductionId: "up-est",
    responsable: "Rida Oukaci",
    email: "rida.oukaci@agence.com",
  },
];

// ─── Stock (Agence Alger Centre — ag-001) ───────────────────────────────────
export const STOCKS_AG001: StockRecord[] = [
  {
    id: "s-001-cirta",
    agenceId: "ag-001",
    produitId: "vms-cirta-125",
    quantiteActuelle: 3,
    stockMinimum: 5,
    stockEntrant: 2,
    delaiReapprovisionnement: 7,
  },
  {
    id: "s-001-clio",
    agenceId: "ag-001",
    produitId: "vms-clio-125",
    quantiteActuelle: 12,
    stockMinimum: 4,
    stockEntrant: 0,
    delaiReapprovisionnement: 7,
  },
  {
    id: "s-001-saphir",
    agenceId: "ag-001",
    produitId: "vms-saphir-150",
    quantiteActuelle: 1,
    stockMinimum: 3,
    stockEntrant: 0,
    delaiReapprovisionnement: 10,
  },
  {
    id: "s-001-cobra",
    agenceId: "ag-001",
    produitId: "vms-cobra-250",
    quantiteActuelle: 6,
    stockMinimum: 2,
    stockEntrant: 0,
    delaiReapprovisionnement: 14,
  },
  {
    id: "s-001-jumper",
    agenceId: "ag-001",
    produitId: "vms-jumper-150",
    quantiteActuelle: 0,
    stockMinimum: 4,
    stockEntrant: 3,
    delaiReapprovisionnement: 7,
  },
];

// ─── Historique des ventes (ag-001) — 7 derniers mois ───────────────────────
export const HISTORIQUE_VENTES: DonneesHistoriques[] = [
  { mois: "Mai", ventes: 28, prevision: 26 },
  { mois: "Juin", ventes: 34, prevision: 31 },
  { mois: "Juil", ventes: 41, prevision: 38 },
  { mois: "Août", ventes: 38, prevision: 40 },
  { mois: "Sep", ventes: 29, prevision: 32 },
  { mois: "Oct", ventes: 33, prevision: 31 },
  { mois: "Nov", ventes: 24, prevision: 30 },
];

// Prévisions futures (Nov–Jan)
export const PREVISIONS_FUTURES: DonneesHistoriques[] = [
  { mois: "Déc", prevision: 28 },
  { mois: "Jan", prevision: 25 },
];

// ─── Alertes Stock (ag-001) ───────────────────────────────────────────────────
export const ALERTES: AlerteStock[] = [
  {
    id: "al-001",
    agenceId: "ag-001",
    produitId: "vms-jumper-150",
    type: "rupture_imminente",
    message: "Rupture totale — Jumper 150 en rupture de stock. 3 unités en transit (arrivée ~7 jours).",
    priorite: "haute",
    date: "2026-11-21",
    lue: false,
  },
  {
    id: "al-002",
    agenceId: "ag-001",
    produitId: "vms-cirta-125",
    type: "stock_faible",
    message: "Stock faible — Cirta 125 : 3 unités en stock (seuil minimum : 5). Réapprovisionnement recommandé.",
    priorite: "haute",
    date: "2026-11-21",
    lue: false,
  },
  {
    id: "al-003",
    agenceId: "ag-001",
    produitId: "vms-saphir-150",
    type: "stock_faible",
    message: "Stock faible — Saphir 150 : 1 unité restante (seuil minimum : 3). Risque de rupture dans 7 jours.",
    priorite: "haute",
    date: "2026-11-20",
    lue: false,
  },
  {
    id: "al-004",
    agenceId: "ag-001",
    produitId: "vms-cirta-125",
    type: "recommandation_transfert",
    message: "Transfert recommandé — L'Agence Blida dispose d'un excédent de Cirta 125 (8 unités disponibles). Transfert de 4 unités proposé.",
    priorite: "moyenne",
    date: "2026-11-21",
    lue: true,
  },
];

// ─── Demandes de Transfert (ag-001) ──────────────────────────────────────────
export const TRANSFERTS: DemandeTransfert[] = [
  {
    id: "tr-001",
    produitId: "vms-cirta-125",
    sourceAgenceId: "ag-002",
    destinationAgenceId: "ag-001",
    quantite: 4,
    statut: "en_attente_approbation",
    raisonRecommandation: "Agence Alger Centre en rupture imminente ; Agence Blida dispose d'un excédent après protection de son stock de sécurité.",
    dateCreation: "2026-11-21",
    dateMiseAJour: "2026-11-21",
    notes: "Transfert généré automatiquement par le moteur de recommandation VMS Nexus.",
  },
  {
    id: "tr-002",
    produitId: "vms-saphir-150",
    sourceAgenceId: "ag-003",
    destinationAgenceId: "ag-001",
    quantite: 2,
    statut: "proposé",
    raisonRecommandation: "Agence Tipaza possède 5 Saphir 150 avec seulement 2 unités de stock minimum requis.",
    dateCreation: "2026-11-20",
    dateMiseAJour: "2026-11-20",
  },
  {
    id: "tr-003",
    produitId: "vms-clio-125",
    sourceAgenceId: "ag-001",
    destinationAgenceId: "ag-004",
    quantite: 3,
    statut: "approuvé",
    raisonRecommandation: "Agence Alger Centre en excédent ; Agence Constantine en rupture imminente.",
    dateCreation: "2026-11-18",
    dateMiseAJour: "2026-11-19",
    approuvePar: "Responsable UP Centre",
  },
  {
    id: "tr-004",
    produitId: "vms-jumper-150",
    sourceAgenceId: "ag-002",
    destinationAgenceId: "ag-001",
    quantite: 2,
    statut: "terminé",
    raisonRecommandation: "Transfert d'urgence suite à rupture totale.",
    dateCreation: "2026-11-10",
    dateMiseAJour: "2026-11-15",
    approuvePar: "Responsable UP Centre",
  },
];
