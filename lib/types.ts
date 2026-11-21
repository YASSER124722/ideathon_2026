// ─── Types de données VMS SMART ─────────────────────────────────────────────

export interface UniteDeProduction {
  id: string;
  nom: string;
  region: string;
  agences: string[]; // IDs des agences rattachées
  responsable: string;
  capaciteEntrepot: number; // en unités
  stockEntrepotActuel: number;
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
  cylindree: string;
  puissance: string;
}

export interface StockRecord {
  id: string;
  agenceId: string;
  produitId: string;
  quantiteActuelle: number;
  stockMinimum: number; // stock de sécurité configurable
  stockEntrant: number; // en transit
  delaiReapprovisionnement: number; // jours
}

export interface WarehouseStockRecord {
  id: string;
  uniteProductionId: string;
  produitId: string;
  quantiteDisponible: number;
  quantiteReservee: number;
  stockSecurite: number;
  cadenceFabricationSemaine: number;
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
  sourceAgenceId: string; // ou "up-centre" si réappro direct entrepôt
  destinationAgenceId: string;
  quantite: number;
  statut: StatutTransfert;
  raisonRecommandation: string;
  dateCreation: string;
  dateMiseAJour: string;
  approuvePar?: string;
  notes?: string;
  typeTransfert?: "inter_agence" | "reappro_up" | "inter_up";
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
  mois: string; // "Mai", "Juin"…
  ventes?: number;
  prevision?: number;
}

export interface PieceRechange {
  id: string;
  reference: string;
  designation: string;
  modelesCompatibles: string[];
  stockActuel: number;
  stockMinimum: number;
  demandeEstimee30j: number;
  prixPublic: number;
  unite: string;
}

export interface AuditSecurityEvent {
  id: string;
  timestamp: string;
  userEmail: string;
  userRole: string;
  agenceId: string;
  action: string;
  ressource: string;
  statut: "autorise" | "refuse";
  details: string;
}

export interface UserAccessRecord {
  id: string;
  nom: string;
  email: string;
  role: "Agence" | "Unité de production" | "Direction";
  perimetre: string;
  statut: "Actif" | "Suspendu";
  derniereConnexion: string;
}

export interface ProductionOrder {
  id: string;
  produitId: string;
  uniteProductionId: string;
  quantite: number;
  statut: "Planifié" | "En cours" | "Terminé";
  dateLancement: string;
  dateFinEstimee: string;
  priorite: "Haute" | "Normale";
}
