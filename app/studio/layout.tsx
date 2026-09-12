import { getCurrentUser } from "@/lib/auth";
import { listUsers } from "@/lib/store/catalog";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { ToastProvider } from "@/components/ui/Toast";

export const dynamic = "force-dynamic";

export default async function StudioLayout({ children }: { children: React.ReactNode }) {
  const currentUser = await getCurrentUser();
  const users = listUsers();

  return (
    <ToastProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar role={currentUser.role} />
        <div className="flex min-w-0 grow flex-col">
          <Topbar currentUser={currentUser} users={users} />
          <main className="grow overflow-y-auto">
            <div className="mx-auto max-w-[1400px] px-4 py-6 md:px-8 md:py-8">{children}</div>
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
