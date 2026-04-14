import {
  Activity,
  AlertCircle,
  BarChart3,
  CheckCircle2,
  FolderKanban,
  PieChartIcon,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { StatCard } from "../components/custom/Card";
import { StatCardSkeleton } from "../components/custom/Skeleton";
import {
  apiGetDashboardStats,
  apiListProjects,
} from "../services/api";

// ─── Chart theme ──────────────────────────────────────────────────────────────

const CHART_COLORS = {
  primary: "oklch(0.72 0.19 268)",
  primaryMuted: "oklch(0.72 0.19 268 / 0.25)",
  accent: "oklch(0.68 0.16 189)",
  accentMuted: "oklch(0.68 0.16 189 / 0.25)",
  emerald: "oklch(0.65 0.18 142)",
  amber: "oklch(0.76 0.15 76)",
};
const PIE_COLORS = [
  CHART_COLORS.primary,
  CHART_COLORS.accent,
  CHART_COLORS.emerald,
  CHART_COLORS.amber,
];

const TOOLTIP_STYLE = {
  background: "oklch(0.12 0 0 / 0.95)",
  border: "1px solid oklch(0.28 0.04 268 / 0.6)",
  borderRadius: "12px",
  fontSize: 12,
  backdropFilter: "blur(12px)",
};
// ─── Section Header ───────────────────────────────────────────────────────────

function ChartHeader({ icon: Icon, title, subtitle, color = "primary" }) {
  const colorMap = {
    primary: "bg-primary/15 text-primary",
    accent: "bg-accent/15 text-accent",
  };
  return (
    <div className="flex items-start gap-3 mb-6">
      <div
        className={`w-9 h-9 rounded-xl ${colorMap[color]} flex items-center justify-center shrink-0`}
      >
        <Icon className="w-4.5 h-4.5" />
      </div>
      <div>
        <h3 className="font-bold font-display text-sm">{title}</h3>
        <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}

// ─── Weekly Activity Mock ──────────────────────────────────────────────────────

const WEEKLY = [
  { day: "Mon", tasks: 8, completed: 5 },
  { day: "Tue", tasks: 14, completed: 11 },
  { day: "Wed", tasks: 10, completed: 7 },
  { day: "Thu", tasks: 18, completed: 14 },
  { day: "Fri", tasks: 12, completed: 10 },
  { day: "Sat", tasks: 5, completed: 4 },
  { day: "Sun", tasks: 3, completed: 3 },
];

// ─── ReportsPage ──────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([apiGetDashboardStats(), apiListProjects()])
      .then(([s, p]) => {
        const statsData = s.data;
        setStats(statsData);
        
        setChartData(
          p.data.map((proj) => ({
            name:
              proj.name.length > 14 ? `${proj.name.slice(0, 14)}…` : proj.name,
            tasks: proj.totalTasks,
            done: proj.completedTasks,
          })),
        );

        // Map aggregated stats to pie chart data
        setPieData([
          { name: "To Do", value: statsData.todoTasks || 0 },
          { name: "In Progress", value: statsData.inProgressTasks || 0 },
          { name: "Done", value: statsData.completedTasks || 0 },
          { name: "Backlog", value: statsData.backlogTasks || 0 },
        ]);
      })
      .catch(() => toast.error("Failed to load reports"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {loading
            ? [1, 2, 3, 4].map((i) => <StatCardSkeleton key={i} />)
            : stats
              ? [
                  {
                    label: "Total Projects",
                    value: stats.totalProjects,
                    icon: <FolderKanban size={18} />,
                    trend: {
                      value: `${stats.activeProjects} active`,
                      positive: true,
                    },
                  },
                  {
                    label: "Tasks Done",
                    value: stats.completedTasks,
                    icon: <CheckCircle2 size={18} />,
                    trend: { value: "This month", positive: true },
                  },
                  {
                    label: "Completion Rate",
                    value: `${stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}%`,
                    icon: <TrendingUp size={18} />,
                    trend: { value: "vs last month", positive: true },
                  },
                  {
                    label: "Overdue",
                    value: stats.overdueTasks,
                    icon: <AlertCircle size={18} />,
                    trend: {
                      value:
                        stats.overdueTasks > 0
                          ? "Needs attention"
                          : "All good!",
                      positive: stats.overdueTasks === 0,
                    },
                  },
                ].map((s, i) => (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <StatCard
                      label={s.label}
                      value={s.value}
                      icon={s.icon}
                      trend={s.trend}
                    />
                  </motion.div>
                ))
              : null}
        </div>

        {/* Main Charts Row */}
        <div className="grid lg:grid-cols-3 gap-5">
          {/* Bar Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 glass-card-elevated p-6"
          >
            <ChartHeader
              icon={BarChart3}
              title="Tasks by Project"
              subtitle="Total vs completed tasks per project"
              color="primary"
            />
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData} barGap={4} barCategoryGap="30%">
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="oklch(0.28 0 0 / 0.4)"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "oklch(0.55 0 0)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "oklch(0.55 0 0)" }}
                  axisLine={false}
                  tickLine={false}
                  width={28}
                />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  labelStyle={{
                    color: "oklch(0.92 0 0)",
                    fontWeight: 700,
                    marginBottom: 4,
                  }}
                  itemStyle={{ color: "oklch(0.65 0 0)" }}
                  cursor={{ fill: "oklch(0.72 0.19 268 / 0.06)" }}
                />
                <Bar
                  dataKey="tasks"
                  name="Total"
                  fill={CHART_COLORS.primaryMuted}
                  radius={[5, 5, 0, 0]}
                />
                <Bar
                  dataKey="done"
                  name="Completed"
                  fill={CHART_COLORS.primary}
                  radius={[5, 5, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Pie Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card-elevated p-6"
          >
            <ChartHeader
              icon={PieChartIcon}
              title="Task Status"
              subtitle="Distribution by status"
              color="accent"
            />
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="45%"
                  innerRadius={52}
                  outerRadius={78}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {pieData.map((_entry, index) => (
                    <Cell
                      key={`cell-${_entry.name}`}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  itemStyle={{ color: "oklch(0.65 0 0)" }}
                />
                <Legend
                  iconSize={8}
                  iconType="circle"
                  wrapperStyle={{ fontSize: 11, color: "oklch(0.62 0 0)" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Weekly Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card-elevated p-6"
        >
          <ChartHeader
            icon={Activity}
            title="Weekly Activity"
            subtitle="Tasks created vs completed over the last 7 days"
            color="emerald"
          />
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={stats?.weeklyTrend ?? WEEKLY} barGap={3} barCategoryGap="35%">
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="oklch(0.28 0 0 / 0.4)"
                vertical={false}
              />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11, fill: "oklch(0.55 0 0)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "oklch(0.55 0 0)" }}
                axisLine={false}
                tickLine={false}
                width={28}
              />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                labelStyle={{
                  color: "oklch(0.92 0 0)",
                  fontWeight: 700,
                  marginBottom: 4,
                }}
                itemStyle={{ color: "oklch(0.65 0 0)" }}
                cursor={{ fill: "oklch(0.68 0.16 189 / 0.06)" }}
              />
              <Bar
                dataKey="tasks"
                name="Created"
                fill={CHART_COLORS.accentMuted}
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="completed"
                name="Completed"
                fill={CHART_COLORS.emerald}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </>
  );
}
