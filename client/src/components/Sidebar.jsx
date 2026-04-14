import { cn } from "@/lib/utils";
import { Link, useLocation } from "@tanstack/react-router";
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useAuth } from "../contexts/AuthContext";
import { useSidebarStore } from "../hooks/useSidebarStore";
import { APP_NAME } from "../constants";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/projects", label: "Projects", icon: FolderKanban },
  { to: "/team", label: "Team", icon: Users },
  { to: "/reports", label: "Reports", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const { collapsed, toggleCollapsed } = useSidebarStore();
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="flex flex-col h-screen sticky top-0 bg-sidebar border-r border-sidebar-border z-30 overflow-hidden shrink-0"
    >
      {/* Logo */}
      <Link
        to="/"
        title="Back to Landing Page"
        className={cn(
          "flex items-center h-16 border-b border-sidebar-border px-4 gap-3 shrink-0 hover:bg-sidebar-accent/5 transition-colors",
          collapsed && "justify-center px-0",
        )}
      >
        {/* Logo mark with pulsing gradient */}
        <div className="relative shrink-0 flex justify-center items-center -gap-5">
          <img
            src="/LumoPng.png"
            alt="Lumo Logo"
            className="h-12 w-auto object-contain"
          />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.25 }}
                className="font-display font-bold text-3xl gradient-text whitespace-nowrap overflow-hidden"
              >
                {APP_NAME}
              </motion.span>
            )}
          </AnimatePresence>
        </div>


      </Link>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 space-y-0.5 px-2">
        {NAV_ITEMS.map(({ to, label, icon: Icon }, index) => {
          const isActive =
            location.pathname === to || location.pathname.startsWith(`${to}/`);
          return (
            <motion.div
              key={to}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                to={to}
                data-ocid={`nav-${label.toLowerCase()}`}
                className={cn(
                  "relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-smooth group",
                  collapsed ? "justify-center" : "",
                  isActive
                    ? "text-primary"
                    : "text-sidebar-foreground/65 hover:bg-sidebar-accent/10 hover:text-sidebar-foreground",
                )}
                title={collapsed ? label : ""}
              >
                {/* Active gradient pill indicator */}
                {isActive && (
                  <>
                    <motion.span
                      layoutId="sidebar-active-pill"
                      className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/15 to-accent/8 border border-primary/25"
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 35,
                      }}
                    />
                    {/* Left border glow */}
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-r-full bg-gradient-to-b from-primary to-accent shadow-[0_0_8px_oklch(0.72_0.19_268/0.5)]" />
                  </>
                )}
                <Icon
                  className={cn(
                    "relative shrink-0 transition-smooth",
                    isActive
                      ? "text-primary"
                      : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground",
                  )}
                  size={18}
                />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="relative whitespace-nowrap"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {isActive && !collapsed && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="relative ml-auto h-1.5 w-1.5 rounded-full bg-primary shadow-glow-subtle"
                  />
                )}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* User section + Collapse */}
      <div className="border-t border-sidebar-border p-2 space-y-1 shrink-0">
        {/* User card */}
        {user && (
          <div
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg bg-muted/20 border border-border/30",
              collapsed ? "justify-center" : "",
            )}
          >
            <div className="relative shrink-0">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-8 w-8 rounded-full ring-2 ring-primary/30 object-cover bg-muted"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/70 to-accent/70 flex items-center justify-center text-primary-foreground text-xs font-bold ring-2 ring-primary/25 shadow-glow-subtle">
                  {(user.name?.[0] ?? user.email?.[0] ?? "U").toUpperCase()}
                </div>
              )}
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-sidebar" />
            </div>

            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="min-w-0 flex-1"
                >
                  <p className="text-xs font-semibold text-sidebar-foreground truncate">
                    {user.name}
                  </p>
                  <span className="inline-flex items-center gap-1 mt-0.5">
                    <span className="text-[10px] text-muted-foreground capitalize truncate">
                      {user.email}
                    </span>
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Role badge row (only expanded) */}
        {user && !collapsed && (
          <div className="px-3 pb-1 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold border border-primary/20 capitalize">
              {user.role}
            </span>
          </div>
        )}

        <button
          type="button"
          onClick={logout}
          data-ocid="nav-logout"
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-smooth",
            collapsed ? "justify-center" : "",
          )}
          title={collapsed ? "Log out" : ""}
        >
          <LogOut size={15} />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.12 }}
              >
                Log out
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        {/* Collapse toggle */}
        <button
          type="button"
          onClick={toggleCollapsed}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:bg-muted/30 hover:text-foreground transition-smooth",
            collapsed ? "justify-center" : "justify-between",
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {!collapsed && <span>Collapse</span>}
          <motion.span
            animate={{ rotate: collapsed ? 0 : 180 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronRight size={14} />
          </motion.span>
        </button>
      </div>
    </motion.aside>
  );
}
