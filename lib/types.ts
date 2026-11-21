// ─── Types de données VMS Nexus ─────────────────────────────────────────────

export interface UniteDeProduction {
  id: string;
  nom: string;
  region: string;
  agences: string[]; // IDs des agences
}

export interface Agence {
  id: string;
  nom: string;
  wilaya: string;
  uniteDeProductionId: string;
  responsable: string;
  email: string;
}

export interface Produit {
  id: string;
  modele: string;
  marque: "VMS";
  categorie: string;
  prixPublic: number; // Prix public de référence (DZD)
  sourceUrl: string;
  dateSource: string;
  imageUrl?: string;
}

export interface StockRecord {
  id: string;
  agenceId: string;
  produitId: string;
  quantiteActuelle: number;
  stockMinimum: number; // stock de sécurité
  stockEntrant: number; // en transit
  delaiReapprovisionnement: number; // jours
}

export type StatutStock = "critique" | "alerte" | "normal" | "excedent";

export interface LigneInventaire {
  produit: Produit;
  stock: StockRecord;
  statutStock: StatutStock;
  demandePrevisionnelle7j: number;
  demandePrevisionnelle30j: number;
  demandePrevisionnelle90j: number;
  pointDeCommande: number; // reorder point
}

export type StatutTransfert =
  | "proposé"
  | "en_attente_approbation"
  | "approuvé"
  | "rejeté"
  | "en_transit"
  | "terminé"
  | "annulé";

export interface DemandeTransfert {
  id: string;
  produitId: string;
  sourceAgenceId: string;
  destinationAgenceId: string;
  quantite: number;
  statut: StatutTransfert;
  raisonRecommandation: string;
  dateCreation: string;
  dateMiseAJour: string;
  approuvePar?: string;
  notes?: string;
}

export interface VenteRecord {
  id: string;
  agenceId: string;
  produitId: string;
  date: string;
  quantiteVendue: number;
}

export interface AlerteStock {
  id: string;
  agenceId: string;
  produitId: string;
  type: "rupture_imminente" | "stock_faible" | "excedent" | "recommandation_transfert";
  message: string;
  priorite: "haute" | "moyenne" | "basse";
  date: string;
  lue: boolean;
}

export interface DonneesHistoriques {
  mois: string; // "Jan", "Fév"…
  ventes?: number;
  prevision?: number;
}
