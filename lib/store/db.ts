import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type {
  AuditLogEntry,
  Campaign,
  Category,
  Content,
  ContentAnalytics,
  ContentVersion,
  MediaAsset,
  Review,
  Tag,
  User,
} from "@/types";
import { seedDatabase } from "./seed";

/**
 * Mock "database" layer.
 *
 * The rest of the app (API routes, server actions) talks to this module the
 * same way it would talk to a Supabase/Postgres client: small, explicit
 * functions like `listContent()` / `createContent()` / `updateContent()`.
 * That boundary is deliberate — swapping this file for real `@supabase/ssr`
 * queries later should not require touching any route or component.
 *
 * Persistence here is a single JSON file on disk (data/db.json), read fresh
 * on every call and rewritten on every mutation. That's obviously not how
 * you'd run this in production, but it gives the demo real persistence
 * across requests and hot reloads without standing up Postgres.
 *
 * Vercel note: the deployed filesystem is read-only except /tmp, and /tmp is
 * not guaranteed to be shared across function instances — so on Vercel this
 * falls back to /tmp, which keeps writes from crashing but means the demo
 * data can reset on a cold start rather than persisting indefinitely like it
 * does in local dev. For a real persistent deployment, swap this file for
 * Supabase per supabase/migrations/0001_init.sql.
 */

export interface Database {
  users: User[];
  content: Content[];
  versions: ContentVersion[];
  reviews: Review[];
  categories: Category[];
  tags: Tag[];
  campaigns: Campaign[];
  media: MediaAsset[];
  auditLog: AuditLogEntry[];
  analytics: ContentAnalytics[];
}

const DATA_DIR = process.env.VERCEL
  ? path.join("/tmp", "gtm-content-hub-data")
  : path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "db.json");

function ensureDb(): Database {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DB_PATH)) {
    const seeded = seedDatabase();
    fs.writeFileSync(DB_PATH, JSON.stringify(seeded, null, 2), "utf-8");
    return seeded;
  }
  try {
    const raw = fs.readFileSync(DB_PATH, "utf-8");
    return JSON.parse(raw) as Database;
  } catch {
    const seeded = seedDatabase();
    fs.writeFileSync(DB_PATH, JSON.stringify(seeded, null, 2), "utf-8");
    return seeded;
  }
}

export function readDb(): Database {
  return ensureDb();
}

export function writeDb(db: Database): void {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
}

export function resetDb(): Database {
  const seeded = seedDatabase();
  writeDb(seeded);
  return seeded;
}

export function newId(): string {
  return randomUUID();
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

// ---- Audit -----------------------------------------------------------

export function logAudit(
  db: Database,
  entry: Omit<AuditLogEntry, "id" | "createdAt">
): void {
  db.auditLog.unshift({ ...entry, id: newId(), createdAt: nowIso() });
  db.auditLog = db.auditLog.slice(0, 500);
}
