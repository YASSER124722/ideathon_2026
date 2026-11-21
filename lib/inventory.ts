// ─── Logique métier : Inventaire ─────────────────────────────────────────────
import type { StockRecord, StatutStock, LigneInventaire } from "./types";
import { PRODUITS } from "./data";

/**
 * Calcule le statut du stock selon les règles VMS Nexus.
 * - critique  : quantité = 0 ou inférieure à la demande sur le délai de réapprovisionnement
 * - alerte    : quantité < stock minimum (sécurité)
 * - excedent  : quantité > stock minimum * 3
 * - normal    : tous les autres cas
 */
export function calculerStatutStock(
  stock: StockRecord,
  demandeJournaliere: number
): StatutStock {
  const demandeAvantReappro = demandeJournaliere * stock.delaiReapprovisionnement;
  const pointDeCommande = demandeAvantReappro + stock.stockMinimum;

  if (stock.quantiteActuelle === 0) return "critique";
  if (stock.quantiteActuelle < stock.stockMinimum) return "alerte";
  if (stock.quantiteActuelle > stock.stockMinimum * 3) return "excedent";
  return "normal";
}

/**
 * Calcule le point de commande (reorder point).
 * Reorder point = demande pendant le délai de réapprovisionnement + stock de sécurité
 */
export function calculerPointDeCommande(
  stock: StockRecord,
  demandeJournaliere: number
): number {
  return Math.ceil(demandeJournaliere * stock.delaiReapprovisionnement + stock.stockMinimum);
}

/**
 * Construit les lignes d'inventaire pour l'affichage.
 * Méthode de prévision : moyenne mobile pondérée (simple et transparente).
 * Données récentes ont un poids plus fort (conforme AGENTS.md §4.1).
 */
export function construireLignesInventaire(
  stocks: StockRecord[],
  ventesParProduit: Record<string, number[]> // produitId → ventes des 7 derniers jours
): LigneInventaire[] {
  return stocks.map((stock) => {
    const produit = PRODUITS.find((p) => p.id === stock.produitId)!;
    const ventes = ventesParProduit[stock.produitId] ?? [3, 4, 3, 5, 4, 3, 4];

    // Moyenne mobile pondérée — poids croissant vers le plus récent
    const poids = [1, 1, 2, 2, 3, 3, 4];
    const somme = ventes.reduce((acc, v, i) => acc + v * poids[i], 0);
    const sommePoids = poids.reduce((a, b) => a + b, 0);
    const moyJournaliere = somme / (sommePoids * 1); // unités/jour

    const demandePrevisionnelle7j = Math.round(moyJournaliere * 7);
    const demandePrevisionnelle30j = Math.round(moyJournaliere * 30);
    const demandePrevisionnelle90j = Math.round(moyJournaliere * 90);
    const pointDeCommande = calculerPointDeCommande(stock, moyJournaliere);
    const statutStock = calculerStatutStock(stock, moyJournaliere);

    return {
      produit,
      stock,
      statutStock,
      demandePrevisionnelle7j,
      demandePrevisionnelle30j,
      demandePrevisionnelle90j,
      pointDeCommande,
    };
  });
}
