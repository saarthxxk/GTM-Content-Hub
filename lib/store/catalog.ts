import type { Campaign, Category, Role, Tag, User } from "@/types";
import { newId, readDb, writeDb, logAudit } from "./db";

export function listUsers(): User[] {
  return readDb().users;
}

export function getUser(id: string): User | undefined {
  return readDb().users.find((u) => u.id === id);
}

export function getUserByEmail(email: string): User | undefined {
  return readDb().users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function updateUserRole(id: string, role: Role, actorId: string): User | undefined {
  const db = readDb();
  const user = db.users.find((u) => u.id === id);
  if (!user) return undefined;
  user.role = role;
  logAudit(db, { userId: actorId, action: "role_changed", entityType: "user", entityId: id, entityLabel: user.name, detail: role });
  writeDb(db);
  return user;
}

export function listCategories(): Category[] {
  return readDb().categories;
}

export function createCategory(name: string, actorId: string): Category {
  const db = readDb();
  const category: Category = { id: newId(), name, slug: name.toLowerCase().replace(/\s+/g, "-") };
  db.categories.push(category);
  logAudit(db, { userId: actorId, action: "created", entityType: "category", entityId: category.id, entityLabel: category.name });
  writeDb(db);
  return category;
}

export function listTags(): Tag[] {
  return readDb().tags;
}

export function createTag(name: string, actorId: string): Tag {
  const db = readDb();
  const existing = db.tags.find((t) => t.name.toLowerCase() === name.toLowerCase());
  if (existing) return existing;
  const tag: Tag = { id: newId(), name };
  db.tags.push(tag);
  logAudit(db, { userId: actorId, action: "created", entityType: "tag", entityId: tag.id, entityLabel: tag.name });
  writeDb(db);
  return tag;
}

export function listCampaigns(): Campaign[] {
  return readDb().campaigns;
}

export function createCampaign(input: Omit<Campaign, "id">, actorId: string): Campaign {
  const db = readDb();
  const campaign: Campaign = { id: newId(), ...input };
  db.campaigns.push(campaign);
  logAudit(db, { userId: actorId, action: "created", entityType: "campaign", entityId: campaign.id, entityLabel: campaign.name });
  writeDb(db);
  return campaign;
}

export function listAuditLog(limit = 100) {
  return readDb().auditLog.slice(0, limit);
}
