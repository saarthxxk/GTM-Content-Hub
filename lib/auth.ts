import { cookies } from "next/headers";
import type { User } from "@/types";
import { getUser, listUsers } from "@/lib/store/catalog";

/**
 * Mock authentication.
 *
 * There is no password check here — this is a portfolio/demo build without
 * a configured identity provider. The `/login` screen lets you pick one of
 * the seeded demo users (an author, a reviewer, and an admin) so the RBAC
 * and workflow rules can be exercised end to end.
 *
 * Swapping in real auth means replacing this file with Supabase Auth
 * (`@supabase/ssr`) session handling — `getCurrentUser()` is the only choke
 * point every server component and API route goes through, so nothing else
 * needs to change.
 */
export const SESSION_COOKIE = "gch_user_id";

export async function getCurrentUser(): Promise<User> {
  const store = await cookies();
  const id = store.get(SESSION_COOKIE)?.value;
  const user = id ? getUser(id) : undefined;
  return user ?? listUsers()[0];
}

export async function getCurrentUserId(): Promise<string> {
  const user = await getCurrentUser();
  return user.id;
}
