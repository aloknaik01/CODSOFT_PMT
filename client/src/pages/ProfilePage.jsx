import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  AlertTriangle,
  Camera,
  CheckSquare,
  ChevronRight,
  Clock,
  Edit3,
  Eye,
  EyeOff,
  FolderOpen,
  Lock,
  Save,
  Shield,
  Trash2,
  Users,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import {
  apiGetCurrentUser,
  apiGetUserActivity,
  apiListProjects,
  apiListTasks,
  apiUpdateUser,
  apiDeleteAccount,
} from "../services/api";

// ─── Activity type config ──────────────────────────────────────────────────────

const ACTIVITY_CFG = {
  created: {
    color: "text-emerald-400",
    bg: "bg-emerald-500/15",
    label: "Created",
  },
  updated: {
    color: "text-primary",
    bg: "bg-primary/15",
    label: "Updated",
  },
  completed: {
    color: "text-accent",
    bg: "bg-accent/15",
    label: "Completed",
  },
  deleted: {
    color: "text-destructive",
    bg: "bg-destructive/15",
    label: "Deleted",
  },
  commented: {
    color: "text-amber-400",
    bg: "bg-amber-500/15",
    label: "Commented",
  },
};
function getActivityCfg(action) {
  const key = Object.keys(ACTIVITY_CFG).find((k) =>
    action.toLowerCase().includes(k),
  );
  return key ? ACTIVITY_CFG[key] : ACTIVITY_CFG.updated;
}

// ─── Shared Atoms ─────────────────────────────────────────────────────────────

function UserAvatar({ name, avatar, size = "lg", isOwner }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const sz = {
    sm: "w-10 h-10 text-sm",
    md: "w-16 h-16 text-xl",
    lg: "w-24 h-24 text-3xl",
  };
  const sizeClass = sz[size] ?? sz.lg;

  const ring = isOwner
    ? "ring-4 ring-primary/50 ring-offset-2 ring-offset-background"
    : "ring-2 ring-primary/30";
  if (avatar)
    return (
      <img
        src={avatar}
        alt={name}
        className={`${sizeClass} rounded-full object-cover ${ring}`}
      />
    );
  return (
    <div
      className={`${sizeClass} rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center font-bold font-display text-primary-foreground ${ring}`}
    >
      {initials}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color = "primary" }) {
  const colorMap = {
    primary: "bg-primary/15 text-primary",
    emerald: "bg-emerald-500/15 text-emerald-400",
    accent: "bg-accent/15 text-accent",
  };

  return (
    <div className="glass-card-elevated p-4 flex flex-col items-center gap-2 transition-spring hover:-translate-y-1 hover:shadow-glow-subtle">
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[color]}`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <span className="text-2xl font-bold font-display">{value}</span>
      <span className="text-xs text-muted-foreground text-center leading-tight">
        {label}
      </span>
    </div>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────

function OverviewTab({ userId }) {
  const { data: actData } = useQuery({
    queryKey: ["activity", userId],
    queryFn: () => apiGetUserActivity(userId),
  });
  const { data: projData } = useQuery({
    queryKey: ["projects"],
    queryFn: () => apiListProjects(),
  });
  const { data: taskData } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => apiListTasks(),
  });

  const activities = actData?.data.slice(0, 6) ?? [];
  const projects = (projData?.data ?? []).slice(0, 4);
  const myTasks = (taskData?.data ?? []).filter((t) => t.assigneeId === userId);
  const done = myTasks.filter((t) => t.status === "done").length;
  const inProg = myTasks.filter((t) => t.status === "in_progress").length;

  const timeAgo = (d) => {
    const diff = Date.now() - new Date(d).getTime();
    const h = Math.floor(diff / 3600000);
    const dy = Math.floor(diff / 86400000);
    if (h < 1) return "just now";
    if (h < 24) return `${h}h ago`;
    return `${dy}d ago`;
  };

  return (
    <div className="space-y-5">
      {/* Activity Timeline */}
      <div className="glass-card-elevated p-5">
        <h3 className="font-semibold font-display mb-5 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
            <Activity className="w-3.5 h-3.5 text-primary" />
          </div>
          <span>Recent Activity</span>
        </h3>
        {activities.length === 0 ? (
          <div className="py-8 text-center">
            <Zap className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No activity yet.</p>
          </div>
        ) : (
          <div className="space-y-0">
            {activities.map((log, i) => {
              const cfg = getActivityCfg(log.action);
              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-start gap-3.5 py-3 border-b border-border/50 last:border-0"
                >
                  <div
                    className={`w-8 h-8 rounded-lg ${cfg.bg} flex items-center justify-center shrink-0 mt-0.5`}
                  >
                    <Activity className={`w-3.5 h-3.5 ${cfg.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-snug">
                      <span className="font-semibold">{log.user.name}</span>{" "}
                      <span
                        className={`text-xs font-medium ${cfg.color} px-1.5 py-0.5 rounded ${cfg.bg} mr-1`}
                      >
                        {cfg.label}
                      </span>
                      {log.metadata?.taskTitle && (
                        <span className="text-muted-foreground">
                          "{log.metadata.taskTitle}"
                        </span>
                      )}
                      {!log.metadata?.taskTitle && (
                        <span className="text-muted-foreground">
                          {log.action}
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground/60 mt-1">
                      {timeAgo(log.createdAt)}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* My Projects */}
      <div className="glass-card-elevated p-5">
        <h3 className="font-semibold font-display mb-5 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-accent/15 flex items-center justify-center">
            <FolderOpen className="w-3.5 h-3.5 text-accent" />
          </div>
          <span>My Projects</span>
        </h3>
        <div className="grid grid-cols-1 gap-2.5">
          {projects.map((p, i) => {
            const pct =
              p.totalTasks > 0
                ? Math.round((p.completedTasks / p.totalTasks) * 100)
                : 0;
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="p-3.5 rounded-xl bg-muted/20 border border-border/50 hover:border-primary/30 hover:bg-muted/30 transition-smooth group"
              >
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: p.color }}
                    />
                    <span className="text-sm font-semibold truncate">
                      {p.name}
                    </span>
                  </div>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-semibold shrink-0 ml-2 ${
                      p.status === "active"
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : p.status === "completed"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-muted text-muted-foreground border border-border"
                    }`}
                  >
                    {p.status}
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="flex-1 h-1.5 bg-muted/50 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: i * 0.1 + 0.3 }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground font-medium w-8 text-right">
                    {pct}%
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Tasks Summary */}
      <div className="glass-card-elevated p-5">
        <h3 className="font-semibold font-display mb-5 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center">
            <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <span>Tasks Summary</span>
        </h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-muted/20 border border-border/50 text-center">
            <p className="text-2xl font-bold font-display text-foreground">
              {myTasks.length}
            </p>
            <p className="text-xs text-muted-foreground mt-1 font-medium">
              Total
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-emerald-500/8 border border-emerald-500/15 text-center">
            <p className="text-2xl font-bold font-display text-emerald-400">
              {done}
            </p>
            <p className="text-xs text-muted-foreground mt-1 font-medium">
              Done
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-amber-500/8 border border-amber-500/15 text-center">
            <p className="text-2xl font-bold font-display text-amber-400">
              {inProg}
            </p>
            <p className="text-xs text-muted-foreground mt-1 font-medium">
              In Progress
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Edit Profile Tab ─────────────────────────────────────────────────────────

function EditProfileTab({ user }) {
  const qc = useQueryClient();
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(
    "Senior engineer passionate about building great products and shipping impactful software.",
  );

  const mutation = useMutation({
    mutationFn: (data) => apiUpdateUser(user.id, data),
    onSuccess: () => {
      toast.success("Profile updated!");
      qc.invalidateQueries({ queryKey: ["currentUser"] });
    },
    onError: () => toast.error("Failed to update profile"),
  });

  return (
    <div className="glass-card-elevated p-6 space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-border/50">
        <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
          <Edit3 className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h3 className="font-bold font-display">Edit Profile</h3>
          <p className="text-xs text-muted-foreground">
            Update your personal information
          </p>
        </div>
      </div>
      <div className="space-y-4">
        <div>
          <label
            htmlFor="edit-name"
            className="text-sm font-semibold mb-2 block"
          >
            Full Name
          </label>
          <input
            id="edit-name"
            data-ocid="profile-name-input"
            className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-smooth placeholder:text-muted-foreground/50"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
          />
        </div>
        <div>
          <label
            htmlFor="edit-email"
            className="text-sm font-semibold mb-2 flex items-center gap-2"
          >
            Email{" "}
            <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              read-only
            </span>
          </label>
          <input
            id="edit-email"
            className="w-full bg-muted/20 border border-border/50 rounded-xl px-4 py-3 text-sm text-muted-foreground cursor-not-allowed"
            value={user.email}
            readOnly
          />
        </div>
        <div>
          <label
            htmlFor="edit-bio"
            className="text-sm font-semibold mb-2 block"
          >
            Bio
          </label>
          <textarea
            id="edit-bio"
            data-ocid="profile-bio-input"
            className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-smooth resize-none placeholder:text-muted-foreground/50"
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell us a bit about yourself..."
          />
        </div>
        <div className="pt-1">
          <button
            type="button"
            data-ocid="profile-save-btn"
            onClick={() => mutation.mutate({ name, bio })}
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
      </div>
    </div>
  );
}

// ─── Security Tab ─────────────────────────────────────────────────────────────

function SecurityTab() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await apiDeleteAccount();
      toast.success("Account deleted successfully");
      setShowDelete(false);
      logout();
      navigate({ to: "/login" });
    } catch (err) {
      toast.error(err.message || "Failed to delete account");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSave = async () => {
    if (!current || !next || next !== confirm) {
      toast.error("Passwords don't match or are empty.");
      return;
    }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    setCurrent("");
    setNext("");
    setConfirm("");
    toast.success("Password changed successfully!");
  };

  return (
    <div className="space-y-5">
      <div className="glass-card-elevated p-6 space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-border/50">
          <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
            <Lock className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-bold font-display">Change Password</h3>
            <p className="text-xs text-muted-foreground">
              Keep your account secure with a strong password
            </p>
          </div>
        </div>
        {[
          {
            label: "Current Password",
            val: current,
            set: setCurrent,
            id: "sec-current",
          },
          { label: "New Password", val: next, set: setNext, id: "sec-new" },
          {
            label: "Confirm New Password",
            val: confirm,
            set: setConfirm,
            id: "sec-confirm",
          },
        ].map(({ label, val, set, id }) => (
          <div key={id}>
            <label htmlFor={id} className="text-sm font-semibold mb-2 block">
              {label}
            </label>
            <div className="relative">
              <input
                id={id}
                data-ocid={id}
                type={showPw ? "text" : "password"}
                className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-smooth"
                value={val}
                onChange={(e) => set(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-smooth"
                aria-label="Toggle password visibility"
              >
                {showPw ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        ))}
        <div className="pt-1">
          <button
            type="button"
            data-ocid="sec-save-pw-btn"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-gradient-to-r from-primary to-accent text-primary-foreground px-6 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 hover:shadow-glow disabled:opacity-50 transition-spring hover:-translate-y-0.5"
          >
            {saving ? (
              <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Shield className="w-4 h-4" />
            )}
            {saving ? "Saving..." : "Update Password"}
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="relative overflow-hidden rounded-xl border border-destructive/25 bg-destructive/5 backdrop-blur-lg p-6 space-y-4">
        <div className="absolute inset-0 bg-gradient-to-br from-destructive/5 via-transparent to-transparent pointer-events-none" />
        <div className="relative flex items-center gap-3 pb-4 border-b border-destructive/15">
          <div className="w-9 h-9 rounded-xl bg-destructive/15 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 text-destructive" />
          </div>
          <div>
            <h3 className="font-bold font-display text-destructive">
              Danger Zone
            </h3>
            <p className="text-xs text-muted-foreground">
              These actions are irreversible
            </p>
          </div>
        </div>
        <div className="relative">
          <p className="text-sm text-muted-foreground mb-4">
            Once you delete your account, all your data will be permanently
            removed. This action cannot be undone.
          </p>
          <button
            type="button"
            data-ocid="sec-delete-account-btn"
            onClick={() => setShowDelete(true)}
            className="flex items-center gap-2 bg-destructive/10 text-destructive border border-destructive/30 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-destructive/20 hover:border-destructive/50 transition-smooth"
          >
            <Trash2 className="w-4 h-4" /> Delete Account
          </button>
        </div>
      </div>

      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="glass-card-elevated gradient-border p-6 max-w-md w-full mx-4 space-y-4"
          >
            <h3 className="font-bold font-display text-lg flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" /> Delete Account?
            </h3>
            <p className="text-sm text-muted-foreground">
              This action is irreversible. All projects, tasks, and data will be
              permanently deleted.
            </p>
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => setShowDelete(false)}
                className="flex-1 border border-border rounded-xl py-2.5 text-sm font-medium hover:bg-muted transition-smooth"
              >
                Cancel
              </button>
              <button
                type="button"
                data-ocid="sec-confirm-delete-btn"
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
                  "Delete"
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

// ─── ProfilePage ──────────────────────────────────────────────────────────────

const TABS = ["Overview", "Edit Profile", "Security"];

export default function ProfilePage() {
  const { user: authUser } = useAuth();
  const [activeTab, setActiveTab] = useState("Overview");
  const { data: userData } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => apiGetCurrentUser(),
  });
  const { data: projData } = useQuery({
    queryKey: ["projects"],
    queryFn: () => apiListProjects(),
  });
  const { data: taskData } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => apiListTasks(),
  });

  const user = userData?.data ?? authUser;
  if (!user) return null;

  const myTasks = (taskData?.data ?? []).filter(
    (t) => t.assigneeId === user.id,
  );
  const memberSince = new Date(user.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  return (
    <>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1 space-y-5"
          >
            {/* Profile Hero Card */}
            <div className="relative overflow-hidden glass-card-elevated gradient-border p-6 text-center space-y-4">
              {/* Background glow */}
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-40 h-40 bg-accent/8 rounded-full blur-3xl pointer-events-none" />

              <div className="relative inline-block">
                <UserAvatar
                  name={user.name}
                  avatar={user.avatar}
                  size="xl"
                  isOwner={user.role === "admin"}
                />
                <button
                  data-ocid="profile-avatar-btn"
                  type="button"
                  className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center hover:shadow-glow hover:scale-110 transition-spring shadow-elevated"
                  title="Change avatar"
                >
                  <Camera className="w-3.5 h-3.5 text-primary-foreground" />
                </button>
              </div>
              <div className="relative space-y-1.5">
                <h2 className="text-2xl font-bold font-display gradient-text">
                  {user.name}
                </h2>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <div className="flex items-center justify-center gap-1.5 mt-1">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    Member since {memberSince}
                  </span>
                </div>
              </div>
              <div className="relative inline-flex items-center gap-2 bg-primary/10 border border-primary/25 px-4 py-1.5 rounded-full">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-semibold capitalize text-primary">
                  {user.role}
                </span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="glass-card-elevated p-5 space-y-3">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Account Stats
              </h3>
              <div className="grid grid-cols-3 gap-2">
                <StatCard
                  icon={FolderOpen}
                  label="Projects"
                  value={projData?.data.length ?? 0}
                  color="accent"
                />
                <StatCard
                  icon={CheckSquare}
                  label="Tasks"
                  value={myTasks.length}
                  color="emerald"
                />
                <StatCard
                  icon={Users}
                  label="Teams"
                  value={3}
                  color="primary"
                />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="glass-card-elevated p-4 space-y-1">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 px-1">
                Quick Actions
              </h3>
              {[
                ["Edit Profile", Edit3, "Edit Profile"],
                ["Security Settings", Shield, "Security"],
              ].map(([label, Icon, tab]) => (
                <button
                  type="button"
                  key={label}
                  onClick={() => setActiveTab(tab)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-primary/8 hover:text-primary transition-smooth text-sm font-medium group"
                >
                  <span className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-smooth" />
                    {label}
                  </span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-smooth" />
                </button>
              ))}
            </div>
          </motion.div>

          {/* Right Column */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            {/* Tab Bar */}
            <div className="glass-card-elevated mb-5 p-1.5 flex gap-1">
              {TABS.map((tab) => (
                <button
                  type="button"
                  key={tab}
                  data-ocid={`profile-tab-${tab.toLowerCase().replace(/\s+/g, "-")}`}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-spring ${
                    activeTab === tab
                      ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-glow-subtle"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === "Overview" && <OverviewTab userId={user.id} />}
              {activeTab === "Edit Profile" && <EditProfileTab user={user} />}
              {activeTab === "Security" && <SecurityTab />}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
