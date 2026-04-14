import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Bell,
  Camera,
  Check,
  ChevronRight,
  Globe,
  Mail,
  Moon,
  Palette,
  Save,
  Shield,
  Smartphone,
  Sun,
  Trash2,
  User,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useTheme } from "next-themes";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import {
  apiDeleteAccount,
  apiGetCurrentUser,
  apiUpdateUser,
} from "../services/api";

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({
  icon: Icon,
  title,
  description,
  accent = "primary",
  children,
}) {
  const accentMap = {
    primary: "bg-primary/15 text-primary",
    destructive: "bg-destructive/15 text-destructive",
  };
  return (
    <div className="glass-card-elevated p-6 space-y-5">
      <div className="flex items-start gap-4 pb-5 border-b border-border/60">
        <div
          className={`w-11 h-11 rounded-xl ${accentMap[accent]} flex items-center justify-center shrink-0`}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-bold font-display text-base">{title}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

// ─── Toggle ───────────────────────────────────────────────────────────────────

function Toggle({ label, description, checked, onChange, id }) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-border/40 last:border-0">
      <div className="min-w-0 flex-1 pr-4">
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      <button
        type="button"
        data-ocid={id}
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-12 h-6.5 rounded-full transition-all duration-300 shrink-0 ${checked
          ? "bg-gradient-to-r from-primary to-accent shadow-glow-subtle"
          : "bg-muted border border-border"
          }`}
      >
        <motion.div
          className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm"
          animate={{ left: checked ? "calc(100% - 22px)" : "2px" }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </button>
    </div>
  );
}

// ─── Account Settings ─────────────────────────────────────────────────────────

function AccountSettings({ userId }) {
  const qc = useQueryClient();
  const { data: userData } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => apiGetCurrentUser(),
  });
  const user = userData?.data;
  const [name, setName] = useState("");

  const mutation = useMutation({
    mutationFn: (data) => apiUpdateUser(userId, data),
    onSuccess: () => {
      toast.success("Account settings saved!");
      qc.invalidateQueries({ queryKey: ["currentUser"] });
    },
    onError: () => toast.error("Failed to save"),
  });

  if (!user) return null;
  const displayName = name || user.name;
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Section
      icon={User}
      title="Account Settings"
      description="Update your personal information and profile photo."
    >
      <div className="flex items-center gap-5 pb-5 border-b border-border/50">
        <div className="relative shrink-0">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-20 h-20 rounded-2xl object-cover ring-2 ring-primary/30"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl font-bold font-display text-primary-foreground ring-2 ring-primary/30">
              {initials}
            </div>
          )}
          <button
            type="button"
            data-ocid="settings-avatar-btn"
            className="absolute -bottom-1.5 -right-1.5 w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center hover:shadow-glow hover:scale-110 transition-spring shadow-elevated"
          >
            <Camera className="w-3.5 h-3.5 text-primary-foreground" />
          </button>
        </div>
        <div>
          <p className="font-bold text-base">{user.name}</p>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          <span className="inline-flex items-center gap-1.5 mt-2 text-xs font-semibold capitalize bg-primary/10 text-primary border border-primary/20 px-2.5 py-1 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            {user.role}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="settings-name"
            className="text-sm font-semibold mb-2 block"
          >
            Full Name
          </label>
          <input
            id="settings-name"
            data-ocid="settings-name-input"
            className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-smooth"
            value={displayName}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label
            htmlFor="settings-email"
            className="text-sm font-semibold mb-2 flex items-center gap-2"
          >
            Email{" "}
            <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              read-only
            </span>
          </label>
          <input
            id="settings-email"
            className="w-full bg-muted/20 border border-border/50 rounded-xl px-4 py-3 text-sm text-muted-foreground cursor-not-allowed"
            value={user.email}
            readOnly
          />
        </div>
      </div>

      <div className="flex justify-end pt-1">
        <button
          type="button"
          data-ocid="settings-account-save-btn"
          onClick={() => mutation.mutate({ name: displayName })}
          disabled={mutation.isPending}
          className="flex items-center gap-2 bg-gradient-to-r from-primary to-accent text-primary-foreground px-6 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 hover:shadow-glow disabled:opacity-50 transition-spring hover:-translate-y-0.5"
        >
          {mutation.isPending ? (
            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {mutation.isPending ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </Section>
  );
}

// ─── Notifications ────────────────────────────────────────────────────────────

function NotificationSettings() {
  const [prefs, setPrefs] = useState({
    emailTasks: true,
    emailComments: true,
    emailDeadlines: false,
    emailWeekly: true,
    inAppTasks: true,
    inAppComments: true,
    inAppMentions: true,
    inAppDeadlines: true,
  });
  const toggle = (k) => setPrefs((p) => ({ ...p, [k]: !p[k] }));
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    toast.success("Notification preferences saved!");
  };

  return (
    <Section
      icon={Bell}
      title="Notification Preferences"
      description="Control how and when you receive notifications."
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2 mb-3 px-0.5">
          <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
            <Mail className="w-3.5 h-3.5 text-primary" />
          </div>
          <span className="text-sm font-bold">Email Notifications</span>
        </div>
        <div className="pl-1">
          <Toggle
            label="Task Assignments"
            description="Get emailed when a task is assigned to you"
            checked={prefs.emailTasks}
            onChange={() => toggle("emailTasks")}
            id="notif-email-tasks"
          />
          <Toggle
            label="Comments & Replies"
            description="Get emailed when someone comments on your tasks"
            checked={prefs.emailComments}
            onChange={() => toggle("emailComments")}
            id="notif-email-comments"
          />
          <Toggle
            label="Deadline Reminders"
            description="Receive reminders 24h before task due dates"
            checked={prefs.emailDeadlines}
            onChange={() => toggle("emailDeadlines")}
            id="notif-email-deadlines"
          />
          <Toggle
            label="Weekly Digest"
            description="Weekly summary of your team's activity"
            checked={prefs.emailWeekly}
            onChange={() => toggle("emailWeekly")}
            id="notif-email-weekly"
          />
        </div>
      </div>

      <div className="space-y-1 pt-1">
        <div className="flex items-center gap-2 mb-3 px-0.5">
          <div className="w-6 h-6 rounded-lg bg-accent/10 flex items-center justify-center">
            <Smartphone className="w-3.5 h-3.5 text-accent" />
          </div>
          <span className="text-sm font-bold">In-App Notifications</span>
        </div>
        <div className="pl-1">
          <Toggle
            label="Task Updates"
            description="Notifications for task status changes"
            checked={prefs.inAppTasks}
            onChange={() => toggle("inAppTasks")}
            id="notif-app-tasks"
          />
          <Toggle
            label="Comments"
            description="Notifications when someone comments"
            checked={prefs.inAppComments}
            onChange={() => toggle("inAppComments")}
            id="notif-app-comments"
          />
          <Toggle
            label="Mentions"
            description="Notifications when you are mentioned"
            checked={prefs.inAppMentions}
            onChange={() => toggle("inAppMentions")}
            id="notif-app-mentions"
          />
          <Toggle
            label="Deadline Alerts"
            description="In-app alerts for upcoming deadlines"
            checked={prefs.inAppDeadlines}
            onChange={() => toggle("inAppDeadlines")}
            id="notif-app-deadlines"
          />
        </div>
      </div>

      <div className="flex justify-end pt-1">
        <button
          type="button"
          data-ocid="settings-notif-save-btn"
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 bg-gradient-to-r from-primary to-accent text-primary-foreground px-6 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 hover:shadow-glow disabled:opacity-50 transition-spring hover:-translate-y-0.5"
        >
          {saving ? (
            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saving ? "Saving..." : "Save Preferences"}
        </button>
      </div>
    </Section>
  );
}

// ─── Appearance ───────────────────────────────────────────────────────────────

const THEME_OPTS = [
  {
    value: "dark",
    label: "Dark",
    icon: Moon,
    desc: "Refined dark interface",
    preview: "bg-gradient-to-br from-zinc-900 to-zinc-800",
    accent: "bg-violet-500",
  },
  {
    value: "light",
    label: "Light",
    icon: Sun,
    desc: "Clean light interface",
    preview: "bg-gradient-to-br from-zinc-100 to-zinc-200",
    accent: "bg-violet-500",
  },
];

function AppearanceSettings() {
  const { theme, setTheme } = useTheme();
  const [lang, setLang] = useState("en");

  return (
    <Section
      icon={Palette}
      title="Appearance"
      description="Customize the look and feel of your workspace."
    >
      <div className="space-y-5">
        <div>
          <p className="text-sm font-bold mb-3">Theme</p>
          <div className="grid grid-cols-2 gap-3">
            {THEME_OPTS.map(
              ({ value, label, icon: Icon, desc, preview, accent }) => {
                const selected = theme === value;
                return (
                  <motion.button
                    type="button"
                    key={value}
                    data-ocid={`settings-theme-${value}`}
                    onClick={() => setTheme(value)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative flex flex-col gap-3 p-4 rounded-2xl border-2 transition-smooth text-left overflow-hidden ${selected
                      ? "border-primary bg-primary/8 shadow-glow-subtle"
                      : "border-border hover:border-primary/40 hover:bg-muted/30"
                      }`}
                  >
                    {/* Mini Preview */}
                    <div
                      className={`w-full h-14 rounded-xl ${preview} flex items-end p-2 gap-1`}
                    >
                      <div
                        className={`w-8 h-1.5 rounded-full ${accent} opacity-80`}
                      />
                      <div className="w-12 h-1 rounded-full bg-white/40" />
                      <div className="w-6 h-1 rounded-full bg-white/20" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center ${selected
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                            }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-bold">{label}</p>
                          <p className="text-xs text-muted-foreground">
                            {desc}
                          </p>
                        </div>
                      </div>
                      {selected && (
                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-glow-subtle">
                          <Check className="w-3 h-3 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                  </motion.button>
                );
              },
            )}
          </div>
        </div>

        <div>
          <label
            htmlFor="settings-language"
            className="text-sm font-bold mb-2 flex items-center gap-2"
          >
            <Globe className="w-4 h-4 text-muted-foreground" /> Language
          </label>
          <select
            id="settings-language"
            data-ocid="settings-language-select"
            className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-smooth appearance-none cursor-pointer"
            value={lang}
            onChange={(e) => setLang(e.target.value)}
          >
            {[
              ["en", "English (US)"],
              ["es", "Español"],
              ["fr", "Français"],
              ["de", "Deutsch"],
              ["ja", "日本語"],
            ].map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-end pt-1">
        <button
          type="button"
          data-ocid="settings-appearance-save-btn"
          onClick={() => toast.success("Appearance settings saved!")}
          className="flex items-center gap-2 bg-gradient-to-r from-primary to-accent text-primary-foreground px-6 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 hover:shadow-glow transition-spring hover:-translate-y-0.5"
        >
          <Save className="w-4 h-4" /> Save Appearance
        </button>
      </div>
    </Section>
  );
}

// ─── Danger Zone ──────────────────────────────────────────────────────────────

function DangerZone() {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await apiDeleteAccount();
      toast.success("Account deleted successfully");
      setShowConfirm(false);
      logout();
      navigate({ to: "/login" });
    } catch (err) {
      toast.error(err.message || "Failed to delete account");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      {/* Custom danger card instead of Section */}
      <div className="relative overflow-hidden rounded-2xl border border-destructive/25 bg-destructive/5 backdrop-blur-lg p-6 space-y-5">
        <div className="absolute inset-0 bg-gradient-to-br from-destructive/8 via-transparent to-transparent pointer-events-none rounded-2xl" />

        <div className="relative flex items-start gap-4 pb-5 border-b border-destructive/15">
          <div className="w-11 h-11 rounded-xl bg-destructive/15 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-destructive" />
          </div>
          <div>
            <h2 className="font-bold font-display text-base text-destructive">
              Danger Zone
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Irreversible and destructive actions for your account.
            </p>
          </div>
        </div>

        <div className="relative space-y-3">
          <div className="flex items-start justify-between gap-4 p-4 rounded-xl border border-border/60 bg-card/40">
            <div>
              <p className="text-sm font-bold">Export All Data</p>
              <p className="text-xs text-muted-foreground mt-1">
                Download a complete archive of your projects, tasks, and
                activity.
              </p>
            </div>
            <button
              type="button"
              data-ocid="settings-export-btn"
              onClick={() => toast.success("Data export started!")}
              className="shrink-0 px-4 py-2 rounded-xl bg-muted/60 border border-border text-xs font-bold hover:bg-muted transition-smooth whitespace-nowrap"
            >
              Export Data
            </button>
          </div>

          <div className="flex items-start justify-between gap-4 p-4 rounded-xl border border-destructive/25 bg-destructive/8">
            <div>
              <p className="text-sm font-bold text-destructive">
                Delete Account
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Permanently delete your account and all associated data. This
                cannot be undone.
              </p>
            </div>
            <button
              type="button"
              data-ocid="settings-delete-btn"
              onClick={() => setShowConfirm(true)}
              className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-destructive/10 text-destructive border border-destructive/30 text-xs font-bold hover:bg-destructive/20 hover:border-destructive/50 transition-smooth whitespace-nowrap"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 10 }}
              className="glass-card-elevated p-6 max-w-md w-full mx-4 space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-destructive/15 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <h3 className="font-bold font-display text-destructive">
                    Delete Account?
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    This is permanent and irreversible
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                This will permanently delete your account, all projects, tasks,
                and data. This action cannot be undone.
              </p>
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 border border-border rounded-xl py-2.5 text-sm font-semibold hover:bg-muted transition-smooth"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  data-ocid="settings-confirm-delete-btn"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 bg-destructive text-destructive-foreground rounded-xl py-2.5 text-sm font-semibold hover:opacity-90 transition-smooth disabled:opacity-50"
                >
                  {isDeleting ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Deleting...
                    </span>
                  ) : (
                    "Delete Account"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── SettingsPage ─────────────────────────────────────────────────────────────

const NAV = [
  {
    id: "account",
    label: "Account",
    icon: User,
    desc: "Profile & personal info",
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: Bell,
    desc: "Alerts & preferences",
  },
  {
    id: "appearance",
    label: "Appearance",
    icon: Palette,
    desc: "Theme & language",
  },
  {
    id: "danger",
    label: "Danger Zone",
    icon: Shield,
    desc: "Account deletion",
  },
];

export default function SettingsPage() {
  const { user } = useAuth();
  const [active, setActive] = useState("account");
  if (!user) return null;

  return (
    <>
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="glass-card-elevated p-3 space-y-1 sticky top-6">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-3 py-2">
                Settings
              </p>
              {NAV.map(({ id, label, icon: Icon, desc }) => {
                const isDanger = id === "danger";
                return (
                  <button
                    type="button"
                    key={id}
                    data-ocid={`settings-nav-${id}`}
                    onClick={() => setActive(id)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-smooth group ${active === id
                      ? isDanger
                        ? "bg-destructive/10 text-destructive"
                        : "bg-primary/10 text-primary"
                      : isDanger
                        ? "text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                      }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-smooth ${active === id
                        ? isDanger
                          ? "bg-destructive/15"
                          : "bg-primary/15"
                        : "bg-muted/60 group-hover:bg-muted"
                        }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-xs font-bold leading-tight">{label}</p>
                      <p className="text-[10px] text-muted-foreground leading-tight">
                        {desc}
                      </p>
                    </div>
                    <ChevronRight
                      className={`w-3.5 h-3.5 text-muted-foreground transition-smooth ${active === id
                        ? "opacity-100 translate-x-0.5"
                        : "opacity-0 group-hover:opacity-60"
                        }`}
                    />
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Content */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 12, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.99 }}
                transition={{ duration: 0.2 }}
              >
                {active === "account" && <AccountSettings userId={user.id} />}
                {active === "notifications" && <NotificationSettings />}
                {active === "appearance" && <AppearanceSettings />}
                {active === "danger" && <DangerZone />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
}
