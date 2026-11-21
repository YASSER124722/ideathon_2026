// Types and helper functions for role detection and session storage

export type UserRole = "agence" | "unit_p" | "direction";

export interface UserSession {
  email: string;
  role: UserRole;
  name: string;
  avatar: string;
  roleLabel: string;
  portalPath: string;
}

export function detectRoleFromEmail(email: string): {
  role: UserRole | null;
  portalPath: string;
  roleLabel: string;
} {
  const normalized = email.trim().toLowerCase();

  if (normalized.includes("@agence.com")) {
    return {
      role: "agence",
      portalPath: "/agence",
      roleLabel: "Espace Agence",
    };
  }

  if (normalized.includes("@unit_p.com")) {
    return {
      role: "unit_p",
      portalPath: "/unites-de-production",
      roleLabel: "Unités de Production",
    };
  }

  if (normalized.includes("@direction.com")) {
    return {
      role: "direction",
      portalPath: "/direction",
      roleLabel: "Direction Générale",
    };
  }

  return {
    role: null,
    portalPath: "",
    roleLabel: "",
  };
}

export const DEMO_ACCOUNTS = [
  {
    role: "agence" as const,
    email: "conseiller@agence.com",
    name: "Sarah Benali",
    title: "Conseillère Commerciale",
    portalPath: "/agence",
    roleLabel: "Espace Agence",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    accentColor: "blue",
    description: "Gestion des clients, contrats et opérations quotidiennes",
  },
  {
    role: "unit_p" as const,
    email: "responsable@unit_p.com",
    name: "Karim Mansouri",
    title: "Chef d'Unité de Production",
    portalPath: "/unites-de-production",
    roleLabel: "Unités de Production",
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
    accentColor: "amber",
    description: "Pilotage des lignes, machines, cadence et maintenance",
  },
  {
    role: "direction" as const,
    email: "directeur@direction.com",
    name: "Dr. Amina Cherif",
    title: "Directrice Générale",
    portalPath: "/direction",
    roleLabel: "Direction Générale",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    accentColor: "emerald",
    description: "Supervision globale, indicateurs stratégiques et décisions",
  },
];

const STORAGE_KEY = "ideathon_user_session";

export function saveSession(email: string): UserSession | null {
  if (typeof window === "undefined") return null;

  const detection = detectRoleFromEmail(email);
  if (!detection.role) return null;

  const demoMatch = DEMO_ACCOUNTS.find((d) => d.role === detection.role);
  const username = email.split("@")[0].replace(/[._]/g, " ");
  const formattedName =
    demoMatch?.name ||
    username
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  const session: UserSession = {
    email,
    role: detection.role,
    name: formattedName,
    avatar: formattedName
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase(),
    roleLabel: detection.roleLabel,
    portalPath: detection.portalPath,
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // ignore
  }

  return session;
}

export function getSession(): UserSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
