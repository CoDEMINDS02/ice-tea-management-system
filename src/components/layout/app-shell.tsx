"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  // All hooks come first, always in the same order.
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // While the mobile drawer is open: close on Escape, lock page scroll,
  // and close automatically if the screen grows to desktop size.
  useEffect(() => {
    if (!mobileOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };

    const desktopQuery = window.matchMedia("(min-width: 1024px)");
    const onQueryChange = (event: MediaQueryListEvent) => {
      if (event.matches) setMobileOpen(false);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    desktopQuery.addEventListener("change", onQueryChange);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      desktopQuery.removeEventListener("change", onQueryChange);
    };
  }, [mobileOpen]);

  // Only after every hook: the login page is a clean full-screen page
  // with no sidebar or topbar.
  if (pathname === "/login") {
    return <main className="min-h-screen bg-background">{children}</main>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar: fixed on the left, visible from lg screens up */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-neutral-200/80 bg-white/85 shadow-[8px_0_32px_rgba(20,48,29,0.04)] backdrop-blur lg:block">
        <Sidebar />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-neutral-900/40"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            className="absolute inset-y-0 left-0 w-72 max-w-[85%] shadow-xl"
          >
            <Sidebar onNavigate={() => setMobileOpen(false)} />
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation menu"
              className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      {/* Main area: pushed right by the sidebar width on desktop */}
      <div className="flex min-h-screen flex-col lg:pl-64">
        <Topbar onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-[1600px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
