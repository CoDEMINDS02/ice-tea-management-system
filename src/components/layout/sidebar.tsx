"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CupSoda, LogOut } from "lucide-react";
import { allNavItems, navSections } from "@/lib/navigation";

type SidebarProps = {
  /** Called after a link is clicked. The mobile drawer uses this to close itself. */
  onNavigate?: () => void;
};

function matches(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Returns the single most specific link for the current page, so that
 * /orders/new highlights "New order" only, not "Orders" as well.
 */
function getActiveHref(pathname: string): string | undefined {
  return allNavItems
    .filter((item) => matches(pathname, item.href))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const activeHref = getActiveHref(pathname);

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Brand */}
      <div className="flex h-20 shrink-0 items-center gap-3 border-b border-neutral-200/80 px-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-800 text-white shadow-lg shadow-brand-900/15">
          <CupSoda className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-bold tracking-tight text-neutral-900">Iced Tea House</p>
          <p className="text-xs text-neutral-500">Operations Console</p>
        </div>
      </div>

      {/* Navigation */}
      <nav aria-label="Main navigation" className="flex-1 overflow-y-auto px-3 py-5">
        {navSections.map((section) => (
          <div key={section.title} className="mb-5">
            <p className="px-3 pb-2 text-xs font-medium uppercase tracking-wider text-neutral-400">
              {section.title}
            </p>
            <ul className="space-y-1">
              {section.items.map((item) => {
                const active = item.href === activeHref;
                const Icon = item.icon;

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        active
                          ? "bg-brand-50 text-brand-800 shadow-sm ring-1 ring-brand-100"
                          : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                      }`}
                    >
                      <Icon
                        className={`h-[18px] w-[18px] ${
                          active ? "text-brand-600" : "text-neutral-400"
                        }`}
                        aria-hidden="true"
                      />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Sign out and demo label */}
      <div className="shrink-0 space-y-3 border-t border-neutral-200 p-4">
        <Link
          href="/login"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
        >
          <LogOut
            className="h-[18px] w-[18px] text-neutral-400"
            aria-hidden="true"
          />
          Sign out
        </Link>

        <div className="rounded-xl border border-brand-100 bg-gradient-to-br from-brand-50 to-white px-3 py-2.5">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-brand-800"><span className="h-1.5 w-1.5 rounded-full bg-brand-500" /> Demo mode</p>
          <p className="mt-0.5 text-xs text-brand-700">Using sample data only</p>
        </div>
      </div>
    </div>
  );
}
