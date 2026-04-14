import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowUpRight,
  BarChart2,
  Bell,
  CheckCheck,
  CheckCircle2,
  Clock,
  FolderKanban,
  FolderPlus,
  Home,
  Info,
  Plus,
  TrendingDown,
  TrendingUp,
  UserPlus,
  Users,
  X,
  Zap,
} from "lucide-react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import { useEffect, useRef, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { StatusBadge } from "../components/custom/Badge";
import { Button } from "../components/custom/Button";
import { Modal } from "../components/custom/Modal";
import {
  ProjectCardSkeleton,
  StatCardSkeleton,
} from "../components/custom/Skeleton";
import { useAuth } from "../contexts/AuthContext";
import {
  apiCreateProject,
  apiGetActivityFeed,
  apiGetDashboardStats,
  apiGetNotifications,
  apiListProjects,
  apiMarkAllNotificationsRead,
  apiMarkNotificationRead,
} from "../services/api";

// ─── Weekly progress data ─────────────────────────────────────────────────────
const weeklyData = [
  { day: "Mon", tasks: 4, completed: 3 },
  { day: "Tue", tasks: 7, completed: 6 },
  { day: "Wed", tasks: 5, completed: 4 },
  { day: "Thu", tasks: 9, completed: 8 },
  { day: "Fri", tasks: 6, completed: 5 },
  { day: "Sat", tasks: 3, completed: 3 },
  { day: "Sun", tasks: 2, completed: 1 },
];

// ─── Animated Counter ─────────────────────────────────────────────────────────
function AnimatedCount({ value, delay = 0 }) {
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { stiffness: 80, damping: 20 });
  const display = useTransform(spring, (v) => Math.round(v).toString());
  const [displayStr, setDisplayStr] = useState("0");

  useEffect(() => {
    const timer = setTimeout(() => {
      motionVal.set(value);
    }, delay * 1000);
    return () => clearTimeout(timer);
  }, [value, motionVal, delay]);

  useEffect(() => {
    const unsub = display.on("change", (v) => setDisplayStr(v));
    return unsub;
  }, [display]);

  return <span>{displayStr}</span>;
}

// ─── Stat config per type ─────────────────────────────────────────────────────
const STAT_STYLES = [
  {
    bg: "bg-blue-500/10 dark:bg-blue-400/10",
    iconColor: "text-blue-500 dark:text-blue-400",
    glowColor: "rgba(59,130,246,0.18)",
    borderHover: "hover:border-blue-500/40",
    gradient: "from-blue-500/20 via-transparent",
  },
  {
    bg: "bg-violet-500/10 dark:bg-violet-400/10",
    iconColor: "text-violet-500 dark:text-violet-400",
    glowColor: "rgba(139,92,246,0.18)",
    borderHover: "hover:border-violet-500/40",
    gradient: "from-violet-500/20 via-transparent",
  },
  {
    bg: "bg-emerald-500/10 dark:bg-emerald-400/10",
    iconColor: "text-emerald-500 dark:text-emerald-400",
    glowColor: "rgba(16,185,129,0.18)",
    borderHover: "hover:border-emerald-500/40",
    gradient: "from-emerald-500/20 via-transparent",
  },
  {
    bg: "bg-amber-500/10 dark:bg-amber-400/10",
    iconColor: "text-amber-500 dark:text-amber-400",
    glowColor: "rgba(245,158,11,0.18)",
    borderHover: "hover:border-amber-500/40",
    gradient: "from-amber-500/20 via-transparent",
  },
];

// ─── Enhanced Stat Card ───────────────────────────────────────────────────────
function EnhancedStatCard({ label, value, icon, trendLabel, positive, index }) {
  const style = STAT_STYLES[index % STAT_STYLES.length];
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.09,
        duration: 0.45,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{
        y: -4,
        transition: { type: "spring", stiffness: 300, damping: 18 },
      }}
      className="group"
      data-ocid={`stat-card-${index}`}
    >
      <div
        className={`relative glass-card p-5 h-full overflow-hidden ${style.borderHover} transition-all duration-300`}
        style={{
          "--hover-glow": style.glowColor,
        }}
      >
        {/* Gradient top accent */}
        <div
          className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${style.gradient} to-transparent opacity-60 group-hover:opacity-100 transition-opacity`}
        />
        {/* Background shimmer */}
        <div
          className={`absolute -top-8 -right-8 h-24 w-24 rounded-full bg-gradient-to-br ${style.gradient} to-transparent blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
        />

        <div className="relative">
          <div className="flex items-start justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
              {label}
            </p>
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className={`p-2.5 rounded-xl ${style.bg} ${style.iconColor} shadow-sm`}
            >
              {icon}
            </motion.div>
          </div>

          <p className="text-4xl font-display font-bold text-foreground tracking-tight mb-2">
            <AnimatedCount value={value} delay={index * 0.09 + 0.2} />
          </p>

          <div
            className={`flex items-center gap-1.5 text-xs font-semibold ${positive ? "text-emerald-500 dark:text-emerald-400" : "text-amber-500 dark:text-amber-400"}`}
          >
            {positive ? (
              <TrendingUp size={12} className="shrink-0" />
            ) : (
              <TrendingDown size={12} className="shrink-0" />
            )}
            <span>{trendLabel}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Custom Chart Tooltip ─────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card p-3 shadow-elevated border border-border/50 min-w-[120px]">
      <p className="text-xs font-bold text-foreground mb-2 border-b border-border/40 pb-1.5">
        {label}
      </p>
      {payload.map((entry) => (
        <div
          key={entry.name}
          className="flex items-center justify-between gap-4 text-xs mt-1"
        >
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span
              className="h-2 w-2 rounded-full inline-block"
              style={{ background: entry.color }}
            />
            {entry.name}
          </span>
          <span className="font-bold text-foreground">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Circular Progress ────────────────────────────────────────────────────────
function CircularProgress({
  value,
  size = 52,
  color = "var(--color-primary)",
}) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="shrink-0 -rotate-90"
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth={4}
        className="text-muted/40"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={4}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-700"
      />
      <title>{value}% progress</title>
      <text
        x={size / 2}
        y={size / 2}
        dominantBaseline="central"
        textAnchor="middle"
        fontSize={size * 0.22}
        fill="currentColor"
        className="fill-foreground"
        transform={`rotate(90, ${size / 2}, ${size / 2})`}
      >
        {value}%
      </text>
    </svg>
  );
}

// ─── Activity Type Config ─────────────────────────────────────────────────────
function activityDotColor(entityType) {
  switch (entityType) {
    case "task":
      return "bg-violet-500";
    case "project":
      return "bg-blue-500";
    case "member":
      return "bg-emerald-500";
    case "comment":
      return "bg-amber-500";
  }
}

function formatTimeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hrs < 24) return `${hrs}h ago`;
  return `${days}d ago`;
}

// ─── Notification Icon ────────────────────────────────────────────────────────
function NotifIcon({ type }) {
  const map = {
    info: {
      icon: Info,
      cls: "text-blue-500 dark:text-blue-400 bg-blue-500/12",
    },
    success: { icon: CheckCircle2, cls: "text-emerald-500 bg-emerald-500/12" },
    warning: { icon: AlertTriangle, cls: "text-amber-500 bg-amber-500/12" },
  };
  const { icon: Icon, cls } = map[type] ?? map.info;
  return (
    <div className={`p-2 rounded-xl shrink-0 ${cls}`}>
      <Icon size={13} />
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-end justify-between mb-5">
      <div>
        <div className="flex items-center gap-2.5 mb-0.5">
          <div className="h-4 w-0.5 bg-gradient-to-b from-primary to-accent rounded-full" />
          <h2 className="font-display font-semibold text-base text-foreground">
            {title}
          </h2>
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground ml-3.5">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}

// ─── Create Project Modal ─────────────────────────────────────────────────────
function CreateProjectModal({ onClose }) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const colors = [
    "#8B5CF6",
    "#06B6D4",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#EC4899",
  ];
  const [color, setColor] = useState(colors[0]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      await apiCreateProject({ name, description: desc, color });
      toast.success("Project created successfully!");
      onClose();
    } catch {
      toast.error("Failed to create project");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={true}
      onClose={onClose}
      title="New Project"
      description="Set up your next big thing"
      footer={
        <>
          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="create-project-form"
            variant="hero"
            size="md"
            className="flex-1"
            data-ocid="modal-create-project-submit"
            disabled={loading}
          >
            {loading ? "Creating…" : "Create Project"}
          </Button>
        </>
      }
    >
      <form id="create-project-form" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="proj-name"
            className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wide"
          >
            Project Name
          </label>
          <input
            id="proj-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Marketing Campaign Q3"
            className="w-full px-3 py-2.5 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            data-ocid="modal-project-name"
            required
          />
        </div>
        <div>
          <label
            htmlFor="proj-desc"
            className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wide"
          >
            Description
          </label>
          <textarea
            id="proj-desc"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="What is this project about?"
            rows={3}
            className="w-full px-3 py-2.5 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none transition-all"
            data-ocid="modal-project-desc"
          />
        </div>
        <div>
          <p className="block text-xs font-semibold text-foreground mb-2 uppercase tracking-wide">
            Accent Color
          </p>
          <div className="flex gap-2">
            {colors.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className="h-7 w-7 rounded-full transition-transform hover:scale-110 relative"
                style={{
                  backgroundColor: c,
                  outline: color === c ? `2px solid ${c}` : "none",
                  outlineOffset: "2px",
                }}
              >
                {color === c && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="h-2 w-2 rounded-full bg-white/90" />
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </form>
    </Modal>
  );
}

// ─── Scrollable Activity Feed ─────────────────────────────────────────────────
function ActivityFeed({ items }) {
  const scrollRef = useRef(null);
  return (
    <div
      ref={scrollRef}
      className="space-y-1 max-h-72 overflow-y-auto pr-1 scrollbar-thin"
      data-ocid="activity-list"
    >
      {items.map((log, i) => (
        <motion.div
          key={log.id}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.06 + 0.45 }}
          className="flex items-start gap-3 py-2.5 px-2 rounded-lg hover:bg-muted/30 transition-colors group"
        >
          <div className="relative shrink-0 mt-0.5">
            <img
              src={log.user.avatar}
              alt={log.user.name}
              className="h-6 w-6 rounded-full ring-1 ring-border/60 object-cover bg-muted"
            />
            <div
              className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border border-card ${activityDotColor(log.entityType)}`}
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-foreground leading-relaxed">
              <span className="font-semibold">{log.user.name}</span>{" "}
              <span className="text-muted-foreground">{log.action}</span>{" "}
              {log.metadata?.taskTitle && (
                <span className="font-medium text-primary">
                  {log.metadata.taskTitle}
                </span>
              )}
            </p>
          </div>
          <span className="text-[10px] text-muted-foreground/50 shrink-0 mt-0.5 group-hover:text-muted-foreground transition-colors">
            {formatTimeAgo(log.createdAt)}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Main Dashboard ────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => apiGetDashboardStats().then((r) => r.data),
  });

  const { data: projResp, isLoading: projectsLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: () => apiListProjects(),
  });
  const projects = projResp?.data ?? [];

  const { data: activityData = [] } = useQuery({
    queryKey: ["activity-feed"],
    queryFn: () => apiGetActivityFeed().then((r) => r.data.data),
  });

  useEffect(() => {
    apiGetNotifications()
      .then((r) => setNotifications(r.data))
      .catch(() => { });
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const recentProjects = projects.slice(0, 6);
  const unreadNotifs = notifications.filter((n) => !n.read);

  const statCards = stats
    ? [
      {
        label: "Total Projects",
        value: stats.totalProjects,
        icon: <FolderKanban size={17} />,
        trendLabel: `${stats.activeProjects} active now`,
        positive: true,
      },
      {
        label: "Active Tasks",
        value: stats.inProgressTasks,
        icon: <Zap size={17} />,
        trendLabel: `${stats.todoTasks} in queue`,
        positive: true,
      },
      {
        label: "Completed",
        value: stats.completedTasks,
        icon: <CheckCircle2 size={17} />,
        trendLabel: "All milestones hit",
        positive: true,
      },
      {
        label: "Team Members",
        value: stats.teamMembers,
        icon: <Users size={17} />,
        trendLabel:
          stats.overdueTasks > 0
            ? `${stats.overdueTasks} overdue`
            : "All on track",
        positive: stats.overdueTasks === 0,
      },
    ]
    : [];

  return (
    <>
      {/* Page Header */}
      <motion.div
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <div>
          <p className="text-xs font-medium text-muted-foreground/60 uppercase tracking-widest mb-1.5">
            {today}
          </p>
          <h1 className="font-display font-bold text-3xl md:text-4xl text-foreground leading-tight">
            {greeting()},{" "}
            <span className="gradient-text">
              {user?.name?.split(" ")[0] ?? "there"}
            </span>
            !
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            Here's what's happening across your workspace today.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Link to="/">
            <Button
              variant="ghost"
              size="md"
              data-ocid="dashboard-back-home"
              title="Back to Home Page"
            >
              <Home size={15} /> <span className="hidden lg:inline ml-1.5">Home</span>
            </Button>
          </Link>
          <Button
            variant="hero"
            size="md"
            onClick={() => setShowCreateModal(true)}
            data-ocid="dashboard-new-project"
          >
            <Plus size={15} /> New Project
          </Button>
          <Link to="/team">
            <Button
              variant="glass"
              size="md"
              data-ocid="dashboard-invite-member"
            >
              <UserPlus size={15} /> Invite
            </Button>
          </Link>
          <Link to="/reports">
            <Button
              variant="ghost"
              size="md"
              data-ocid="dashboard-view-reports"
            >
              <BarChart2 size={15} /> Reports
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statsLoading
          ? [1, 2, 3, 4].map((i) => <StatCardSkeleton key={i} />)
          : statCards.map((s, i) => (
            <EnhancedStatCard
              key={s.label}
              label={s.label}
              value={s.value}
              icon={s.icon}
              trendLabel={s.trendLabel}
              positive={s.positive}
              index={i}
            />
          ))}
      </div>

      {/* Main Grid */}
      <div className="grid xl:grid-cols-3 gap-6">
        {/* Left: Projects + Chart */}
        <div className="xl:col-span-2 space-y-6">
          {/* Recent Projects */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <SectionHeader
              title="Recent Projects"
              subtitle="Your most recently updated workspaces"
              action={
                <Link
                  to="/projects"
                  className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1 font-medium"
                  data-ocid="dashboard-all-projects"
                >
                  View all <ArrowUpRight size={12} />
                </Link>
              }
            />

            {projectsLoading ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <ProjectCardSkeleton key={i} />
                ))}
              </div>
            ) : recentProjects.length === 0 ? (
              <motion.div
                className="glass-card p-12 flex flex-col items-center text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                data-ocid="dashboard-empty-projects"
              >
                <div className="p-4 rounded-2xl bg-primary/10 mb-4">
                  <FolderPlus size={32} className="text-primary" />
                </div>
                <h3 className="font-display font-semibold text-foreground mb-2">
                  No projects yet
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create your first project and start shipping.
                </p>
                <Button
                  variant="hero"
                  size="sm"
                  onClick={() => setShowCreateModal(true)}
                >
                  <Plus size={14} /> Create your first project
                </Button>
              </motion.div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {recentProjects.map((project, i) => {
                  const progress =
                    project.totalTasks > 0
                      ? Math.round(
                        (project.completedTasks / project.totalTasks) * 100,
                      )
                      : 0;
                  const projectColor = project.color ?? "#8B5CF6";
                  return (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: i * 0.07 + 0.25,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      whileHover={{
                        y: -3,
                        transition: {
                          type: "spring",
                          stiffness: 300,
                          damping: 18,
                        },
                      }}
                    >
                      <Link
                        to="/projects/$projectId"
                        params={{ projectId: project.id }}
                        data-ocid={`dashboard-project-${project.id}`}
                      >
                        <div className="relative bg-card rounded-[24px] overflow-hidden border border-border/50 dark:border-white/5 hover:border-primary/30 hover:dark:border-white/10 hover:shadow-premium group h-full transition-all duration-300">
                          {/* Neon Glow Accent */}
                          <div
                            className="absolute -right-16 -top-16 w-32 h-32 blur-[60px] opacity-10 group-hover:opacity-30 transition-opacity duration-700 pointer-events-none"
                            style={{ backgroundColor: projectColor }}
                          />

                          <div className="p-5 relative z-10">
                            <div className="flex items-start gap-3.5 mb-5">
                              {/* First Letter Logo */}
                              <div
                                className="h-12 w-12 rounded-xl flex-shrink-0 flex items-center justify-center text-lg font-black text-white shadow-lg shadow-black/40 group-hover:scale-105 transition-transform duration-500"
                                style={{
                                  background: `linear-gradient(135deg, ${projectColor}, ${projectColor}dd)`,
                                }}
                              >
                                {project.name.charAt(0).toUpperCase()}
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between">
                                  <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors truncate">
                                    {project.name}
                                  </h3>
                                </div>
                                <div className="flex items-center gap-1.5 mt-1">
                                  <span
                                    className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-md flex items-center gap-1"
                                    title="Active Status"
                                  >
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    Active
                                  </span>
                                  <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">
                                    {project.completedTasks} / {project.totalTasks} DONE
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Progress bar area */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-[10px] font-bold">
                                <span className="text-zinc-500 uppercase tracking-widest">
                                  Progress
                                </span>
                                <span className="text-white">{progress}%</span>
                              </div>
                              <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${progress}%` }}
                                  className="h-full rounded-full"
                                  style={{
                                    background: `linear-gradient(to right, ${projectColor}cc, ${projectColor})`,
                                    boxShadow: `0 0 10px ${projectColor}aa`,
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* Weekly Progress Chart */}
          <motion.div
            className="glass-card p-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.45,
              duration: 0.4,
              ease: [0.22, 1, 0.36, 1],
            }}
            data-ocid="dashboard-weekly-chart"
          >
            <SectionHeader
              title="Weekly Progress"
              subtitle="Tasks created vs completed this week"
              action={
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-primary/40 inline-block" />
                    Created
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-primary inline-block" />
                    Completed
                  </span>
                </div>
              }
            />
            <div className="h-64 mt-4 text-primary">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={stats?.weeklyTrend ?? weeklyData}
                  margin={{ top: 4, right: 4, bottom: 0, left: -24 }}
                >
                  <defs>
                    <linearGradient id="gradTasks" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="oklch(0.72 0.19 268)"
                        stopOpacity={0.2}
                      />
                      <stop
                        offset="95%"
                        stopColor="oklch(0.72 0.19 268)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                    <linearGradient
                      id="gradCompleted"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="oklch(0.72 0.2 189)"
                        stopOpacity={0.55}
                      />
                      <stop
                        offset="95%"
                        stopColor="oklch(0.72 0.2 189)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="4 4"
                    stroke="oklch(0.25 0 0 / 0.5)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="day"
                    tick={{
                      fontSize: 11,
                      fill: "oklch(0.62 0 0)",
                      fontFamily: "inherit",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{
                      fontSize: 11,
                      fill: "oklch(0.62 0 0)",
                      fontFamily: "inherit",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    content={<ChartTooltip />}
                    cursor={{
                      stroke: "oklch(0.72 0.19 268 / 0.3)",
                      strokeWidth: 1,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="tasks"
                    name="Created"
                    stroke="oklch(0.72 0.19 268)"
                    strokeOpacity={0.5}
                    strokeWidth={2}
                    fill="url(#gradTasks)"
                    dot={{ r: 3, fill: "oklch(0.72 0.19 268)", strokeWidth: 0 }}
                    activeDot={{
                      r: 5,
                      fill: "oklch(0.72 0.19 268)",
                      strokeWidth: 2,
                      stroke: "oklch(0.08 0 0)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="completed"
                    name="Completed"
                    stroke="oklch(0.72 0.2 189)"
                    strokeWidth={2.5}
                    fill="url(#gradCompleted)"
                    dot={{ r: 3, fill: "oklch(0.72 0.2 189)", strokeWidth: 0 }}
                    activeDot={{
                      r: 5,
                      fill: "oklch(0.72 0.2 189)",
                      strokeWidth: 2,
                      stroke: "oklch(0.08 0 0)",
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-5">
          {/* Notifications Panel */}
          <motion.div
            className="glass-card p-4"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            data-ocid="dashboard-notifications"
          >
            <SectionHeader
              title="Notifications"
              action={
                <div className="flex items-center gap-2">
                  <AnimatePresence>
                    {unreadNotifs.length > 0 && (
                      <motion.span
                        key="badge"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ type: "spring", stiffness: 400 }}
                        className="h-5 min-w-5 px-1.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center"
                      >
                        {unreadNotifs.length}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {unreadNotifs.length > 0 && (
                    <button
                      type="button"
                      data-ocid="dashboard-notifs-mark-all"
                      onClick={() => {
                        apiMarkAllNotificationsRead()
                          .then(() => {
                            setNotifications((prev) =>
                              prev.map((n) => ({ ...n, read: true })),
                            );
                            toast.success("All notifications marked as read");
                          })
                          .catch(() =>
                            toast.error("Failed to mark notifications read"),
                          );
                      }}
                      className="flex items-center gap-1 text-[10px] text-primary hover:text-primary/80 transition-smooth px-1.5 py-1 rounded-md hover:bg-primary/10"
                    >
                      <CheckCheck size={11} />
                      All read
                    </button>
                  )}
                  <Bell size={14} className="text-muted-foreground" />
                </div>
              }
            />
            <div className="space-y-1" data-ocid="notifications-list">
              {notifications.slice(0, 5).map((notif, i) => (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 + 0.35 }}
                  onClick={() => {
                    if (notif.read) return;
                    apiMarkNotificationRead(notif.id)
                      .then(() => {
                        setNotifications((prev) =>
                          prev.map((n) =>
                            n.id === notif.id ? { ...n, read: true } : n,
                          ),
                        );
                      })
                      .catch(() => toast.error("Failed to mark as read"));
                  }}
                  className={`flex items-start gap-2.5 p-2.5 rounded-xl transition-all duration-200 group cursor-pointer ${!notif.read ? "bg-primary/8 hover:bg-primary/12 border border-primary/12" : "opacity-70 hover:opacity-100 hover:bg-muted/40 border border-transparent"}`}
                  data-ocid={`notif-${notif.id}`}
                >
                  <NotifIcon type={notif.type} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-1">
                      <p
                        className={`text-xs truncate ${!notif.read ? "font-semibold text-foreground" : "font-medium text-foreground/70"}`}
                      >
                        {notif.title}
                      </p>
                      {!notif.read && (
                        <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0 mt-1 pulse-soft" />
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">
                      {notif.message}
                    </p>
                    <p className="text-[10px] text-muted-foreground/40 mt-1">
                      {formatTimeAgo(notif.createdAt)}
                    </p>
                  </div>
                </motion.div>
              ))}
              {notifications.length === 0 && (
                <p className="text-xs text-muted-foreground/50 text-center py-4">
                  No notifications yet
                </p>
              )}
            </div>
          </motion.div>

          {/* Activity Feed */}
          <motion.div
            className="glass-card p-4"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            data-ocid="dashboard-activity"
          >
            <SectionHeader
              title="Recent Activity"
              action={
                <Activity size={14} className="text-muted-foreground/60" />
              }
            />
            <ActivityFeed items={activityData.slice(0, 8)} />
            {activityData.length === 0 && (
              <p className="text-xs text-muted-foreground/50 text-center py-4">
                No recent activity
              </p>
            )}
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            className="glass-card p-4"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            data-ocid="dashboard-quick-links"
          >
            <SectionHeader title="Quick Actions" />
            <div className="space-y-1">
              {[
                {
                  label: "Browse All Projects",
                  icon: <FolderKanban size={14} />,
                  to: "/projects",
                  color: "text-blue-400",
                },
                {
                  label: "Team Overview",
                  icon: <Users size={14} />,
                  to: "/team",
                  color: "text-emerald-400",
                },
                {
                  label: "View Reports",
                  icon: <BarChart2 size={14} />,
                  to: "/reports",
                  color: "text-violet-400",
                },
              ].map((item) => (
                <Link key={item.to} to={item.to}>
                  <motion.div
                    whileHover={{ x: 3 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                    data-ocid={`quick-link-${item.to.replace("/", "")}`}
                  >
                    <span
                      className={`${item.color} transition-colors shrink-0`}
                    >
                      {item.icon}
                    </span>
                    <span className="text-sm text-foreground/80 group-hover:text-foreground transition-colors flex-1">
                      {item.label}
                    </span>
                    <ArrowUpRight
                      size={12}
                      className="text-muted-foreground/30 group-hover:text-primary transition-colors"
                    />
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Create Project Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateProjectModal onClose={() => setShowCreateModal(false)} />
        )}
      </AnimatePresence>
    </>
  );
}
