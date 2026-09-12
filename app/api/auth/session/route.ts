import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, getCurrentUser } from "@/lib/auth";
import { getUser, listUsers } from "@/lib/store/catalog";
import { sessionSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  return NextResponse.json({ user, users: listUsers() });
}

/** Demo "login": pick one of the seeded users, no password. */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = sessionSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const user = getUser(parsed.data.userId);
  if (!user) return NextResponse.json({ error: "Unknown user" }, { status: 404 });

  const res = NextResponse.json({ user });
  res.cookies.set(SESSION_COOKIE, user.id, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30 });
  return res;
}
