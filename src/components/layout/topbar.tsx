"use client";

import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { allNavItems } from "@/lib/navigation";

type TopbarProps = {
  /** Called when the mobile menu button is pressed. */
  onMenuClick: () => void;
};

function getPageTitle(pathname: string) {
  if (pathname === "/") return "Dashboard";

  const matches = allNavItems.filter(
    (item) =>
      item.href !== "/" &&
      (pathname === item.href || pathname.startsWith(`${item.href}/`)),
  );

  // The most specific link wins: "/orders/new" beats "/orders".
  const best = matches.sort((a, b) => b.href.length - a.href.length)[0];

  return best ? best.label : "Iced Tea House";
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const pathname = usePathname();
  const title = getPageTitle(pathname);

  return (
    <header className="sticky top-0 z-30 flex h-20 shrink-0 items-center gap-3 border-b border-neutral-200/70 bg-white/75 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
      {/* Mobile menu button: hidden on large screens */}
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open navigation menu"
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 lg:hidden"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>

      {/* Page title */}
      <div>
        <p className="hidden text-xs font-medium uppercase tracking-[0.16em] text-brand-700 sm:block">Iced Tea House</p>
        <h1 className="text-lg font-bold tracking-tight text-neutral-900">{title}</h1>
      </div>

      {/* Demo user */}
      <div className="ml-auto flex items-center gap-3">
        <div className="hidden text-right leading-tight sm:block">
          <p className="text-sm font-semibold text-neutral-900">Demo Admin</p>
          <p className="text-xs text-neutral-500">Owner access</p>
        </div>
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-brand-100 text-sm font-bold text-brand-700 shadow-md shadow-brand-900/10"
          aria-hidden="true"
        >
          DA
        </div>
      </div>
    </header>
  );
}
