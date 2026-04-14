import { useLocation } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";

import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { Outlet, useMatches } from "@tanstack/react-router";

export function Layout({ children }) {
  const matches = useMatches();
  const lastMatch = matches[matches.length - 1];
  const { title, subtitle } = lastMatch?.staticData || {};

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header title={title} subtitle={subtitle} />
        <main className="flex-1 overflow-y-auto relative">
          <div
            className="absolute inset-0 pointer-events-none dark:opacity-100 opacity-0 transition-opacity duration-500"
            style={{
              background:
                "radial-gradient(ellipse 80% 60% at 20% 10%, oklch(0.72 0.19 268 / 0.04) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 80%, oklch(0.72 0.2 189 / 0.03) 0%, transparent 60%), radial-gradient(ellipse 40% 40% at 50% 50%, oklch(0.72 0.19 268 / 0.02) 0%, transparent 100%)",
            }}
          />
          <div className="relative p-6 min-h-full">
            {children || <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
}

export function PublicLayout({ children }) {
  return (
    <div className="min-h-screen bg-background text-foreground">{children}</div>
  );
}
