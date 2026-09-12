import { listUsers } from "@/lib/store/catalog";
import { LoginClient } from "@/components/auth/LoginClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Sign In" };

export default async function LoginPage() {
  const users = listUsers();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <span className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-white text-lg font-bold">G</span>
          <h1 className="text-xl font-semibold text-foreground">GTM Content Hub</h1>
          <p className="mt-1 text-[13px] text-muted">
            This demo has no password login — choose one of the seeded accounts below to explore the platform under that role.
          </p>
        </div>
        <LoginClient users={users} />
      </div>
    </div>
  );
}
