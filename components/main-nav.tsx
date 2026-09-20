"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/skills", label: "Skills", icon: "⚒️" },
  { href: "/pvp", label: "PvP", icon: "⚔️" },
  { href: "/market", label: "Market", icon: "🛒" },
  { href: "/guild", label: "Guild", icon: "🏰" },
];

export function MainNav() {
  const pathname = usePathname();
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col gap-1 border-r border-[#26263a] p-4 md:flex">
        <div className="mb-4 px-2 text-xl font-bold">
          Simple<span className="gold-text">MMO</span>
        </div>
        {TABS.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className={`flex min-h-[44px] items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium ${
              pathname === t.href ? "bg-[#1e1e30] text-white" : "text-muted hover:bg-[#161624]"
            }`}
          >
            <span aria-hidden>{t.icon}</span> {t.label}
          </Link>
        ))}
        <div className="mt-auto px-2 text-xs text-muted">Season 1 • v0.1.0</div>
      </aside>

      {/* Mobile bottom nav */}
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-[#26263a] bg-[#0a0a12]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      >
        <div className="mx-auto grid max-w-lg grid-cols-5">
          {TABS.map((t) => {
            const active = pathname === t.href;
            return (
              <Link
                key={t.href}
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-[60px] flex-col items-center justify-center gap-0.5 text-[11px] font-medium ${
                  active ? "text-white" : "text-muted"
                }`}
              >
                <span aria-hidden className="text-xl leading-none">
                  {t.icon}
                </span>
                {t.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 border-b border-[#26263a] bg-[#0a0a12]/95 px-4 py-3 backdrop-blur md:hidden">
        <div className="text-base font-bold">
          Simple<span className="gold-text">MMO</span>
        </div>
      </div>
    </>
  );
}
