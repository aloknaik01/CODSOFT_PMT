import { cn } from "@/lib/utils";
import { Bell, CheckCheck, Clock, Home, Moon, Search, Sun, X } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import {
  apiGetNotifications,
  apiMarkAllNotificationsRead,
  apiMarkNotificationRead,
} from "../services/api";

function formatRelativeTime(dateStr) {
  try {
    const d = new Date(dateStr);
    const diff = Date.now() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  } catch {
    return "";
  }
}

export function Header({ title, subtitle }) {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const [notifs, setNotifs] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const searchRef = useRef(null);
  const notifRef = useRef(null);
  const isDark = theme === "dark";

  useEffect(() => {
    setMounted(true);
    apiGetNotifications()
      .then((r) => setNotifs(r.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchRef.current?.focus(), 50);
  }, [searchOpen]);

  // Close notifs dropdown on outside click
  useEffect(() => {
    if (!showNotifs) return;
    function handle(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifs(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [showNotifs]);

  const unread = notifs.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-20 h-16 flex items-center justify-between px-6 bg-card/80 backdrop-blur-md border-b border-border/60 shadow-subtle">
      {/* Title */}
      <div className="min-w-0">
        <AnimatePresence mode="wait">
          {title && (
            <motion.h1
              key={title}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.2 }}
              className="font-display font-bold text-lg text-foreground leading-tight truncate"
            >
              {title}
            </motion.h1>
          )}
        </AnimatePresence>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5">
        {/* Expandable Search */}
        <div className="flex items-center">
          <AnimatePresence>
            {searchOpen && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 200, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                className="overflow-hidden"
              >
                <input
                  ref={searchRef}
                  type="text"
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      setSearchOpen(false);
                      setSearchVal("");
                    }
                  }}
                  placeholder="Search anything…"
                  className="w-full h-8 px-3 text-sm bg-muted/40 border border-border/60 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-smooth"
                  data-ocid="header-search-input"
                />
              </motion.div>
            )}
          </AnimatePresence>
          <button
            type="button"
            data-ocid="header-search"
            onClick={() => {
              if (searchOpen) {
                setSearchOpen(false);
                setSearchVal("");
              } else {
                setSearchOpen(true);
              }
            }}
            className={cn(
              "p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-smooth ml-0.5",
              searchOpen && "text-primary bg-primary/10 hover:bg-primary/15",
            )}
            aria-label="Toggle search"
          >
            <Search size={17} />
          </button>
        </div>

        {/* Return to Landing Page */}
        <Link
          to="/"
          data-ocid="header-back-home"
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-smooth"
          title="Back to Landing Page"
        >
          <Home size={17} />
        </Link>

        {/* Theme toggle */}
        {mounted && (
          <button
            type="button"
            data-ocid="header-theme-toggle"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-smooth relative overflow-hidden"
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            <AnimatePresence mode="wait">
              {isDark ? (
                <motion.span
                  key="sun"
                  initial={{ rotate: -90, opacity: 0, scale: 0.7 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: 90, opacity: 0, scale: 0.7 }}
                  transition={{ duration: 0.22 }}
                  className="block"
                >
                  <Sun size={17} />
                </motion.span>
              ) : (
                <motion.span
                  key="moon"
                  initial={{ rotate: 90, opacity: 0, scale: 0.7 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: -90, opacity: 0, scale: 0.7 }}
                  transition={{ duration: 0.22 }}
                  className="block"
                >
                  <Moon size={17} />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        )}

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            data-ocid="header-notifications"
            onClick={() => setShowNotifs((v) => !v)}
            className={cn(
              "p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-smooth relative",
              showNotifs && "text-primary bg-primary/10 hover:bg-primary/15",
            )}
            aria-label="Notifications"
          >
            <Bell size={17} />
            <AnimatePresence>
              {unread > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute top-1 right-1 h-4 w-4 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[9px] font-bold shadow-glow-subtle"
                >
                  {unread > 9 ? "9+" : unread}
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          <AnimatePresence>
            {showNotifs && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.97 }}
                transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
                className="absolute right-0 top-12 w-[340px] glass-card-elevated border border-white/20 dark:border-white/10 shadow-premium z-50 overflow-hidden"
              >
                {/* Header */}
                <div className="px-4 py-3 border-b border-border/60 flex items-center justify-between bg-muted/20">
                  <div className="flex items-center gap-2">
                    <Bell size={14} className="text-primary" />
                    <span className="font-semibold text-sm text-foreground">
                      Notifications
                    </span>
                    {unread > 0 && (
                      <span className="h-5 px-1.5 flex items-center justify-center rounded-full bg-primary/15 text-primary text-[10px] font-bold">
                        {unread}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {unread > 0 && (
                      <button
                        type="button"
                        className="flex items-center gap-1 text-xs text-primary cursor-pointer hover:text-primary/80 transition-smooth px-2 py-1 rounded-md hover:bg-primary/10"
                        onClick={() => {
                          apiMarkAllNotificationsRead()
                            .then(() => {
                              setNotifs((prev) =>
                                prev.map((n) => ({ ...n, read: true })),
                              );
                              toast.success("All marked as read");
                            })
                            .catch(() =>
                              toast.error("Failed to mark notifications read"),
                            );
                        }}
                      >
                        <CheckCheck size={12} />
                        Mark all read
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowNotifs(false)}
                      className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-smooth"
                      aria-label="Close notifications"
                    >
                      <X size={13} />
                    </button>
                  </div>
                </div>

                {/* List */}
                <div className="max-h-72 overflow-y-auto">
                  {notifs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-3">
                      <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center">
                        <Bell size={18} className="text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        You're all caught up
                      </p>
                    </div>
                  ) : (
                    notifs.slice(0, 6).map((n, i) => (
                      <motion.div
                        key={n.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        data-ocid={`notification-item-${n.id}`}
                        onClick={() => {
                          if (n.read) return;
                          apiMarkNotificationRead(n.id)
                            .then(() => {
                              setNotifs((prev) =>
                                prev.map((notif) =>
                                  notif.id === n.id
                                    ? { ...notif, read: true }
                                    : notif,
                                ),
                              );
                            })
                            .catch(() =>
                              toast.error("Failed to mark notification read"),
                            );
                        }}
                        className={cn(
                          "flex gap-3 px-4 py-3 border-b border-border/40 hover:bg-muted/25 transition-smooth cursor-pointer group",
                          !n.read
                            ? "bg-primary/[0.04]"
                            : "opacity-70 hover:opacity-100",
                        )}
                      >
                        {/* Unread dot */}
                        <div className="mt-1.5 shrink-0">
                          {!n.read ? (
                            <span className="h-2 w-2 rounded-full bg-primary block shadow-glow-subtle" />
                          ) : (
                            <span className="h-2 w-2 rounded-full bg-muted-foreground/30 block" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p
                            className={cn(
                              "text-xs font-semibold text-foreground line-clamp-1",
                              !n.read && "text-foreground",
                            )}
                          >
                            {n.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                            {n.message}
                          </p>
                          {n.createdAt && (
                            <div className="flex items-center gap-1 mt-1">
                              <Clock
                                size={10}
                                className="text-muted-foreground/60"
                              />
                              <span className="text-[10px] text-muted-foreground/60">
                                {formatRelativeTime(n.createdAt)}
                              </span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Separator + User avatar */}
        {user && (
          <div className="flex items-center gap-2 ml-1 pl-3 border-l border-border/60">
            <div className="relative group">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-8 w-8 rounded-full ring-2 ring-primary/30 object-cover bg-muted transition-spring group-hover:ring-primary/60"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/70 to-accent/70 flex items-center justify-center text-primary-foreground text-xs font-bold ring-2 ring-primary/30 transition-spring group-hover:ring-primary/60 shadow-glow-subtle">
                  {user.name[0].toUpperCase()}
                </div>
              )}
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-card" />
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-semibold text-foreground leading-tight">
                {user.name}
              </p>
              <p className="text-[10px] text-muted-foreground capitalize leading-tight">
                {user.role}
              </p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
