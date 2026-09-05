import type { ReactNode } from "react";
import { requireInternal } from "@/lib/admin/guard";
import { AdminNav } from "@/components/admin/admin-nav";
import { AdminSearch } from "@/components/admin/admin-search";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

/**
 * The internal command center shell (ADMIN #33). `requireInternal()` renders the
 * 404 page for every non-internal caller, so the whole area — nav included — is
 * undiscoverable to normal customers.
 */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await requireInternal();

  return (
    <div className="min-h-screen bg-[var(--color-surface)] md:flex">
      <AdminNav email={user.email} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="hidden items-center gap-4 border-b border-[var(--color-border)] bg-[var(--color-bg)] px-6 py-3 md:flex">
          <AdminSearch />
        </header>
        <div className="p-4 md:hidden">
          <AdminSearch />
        </div>
        <main id="contenido" className="min-w-0 flex-1 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
