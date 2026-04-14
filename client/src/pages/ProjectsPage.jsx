import { cn } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  Calendar,
  CheckCircle2,
  Edit3,
  FolderOpen,
  Grid3X3,
  List,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { StatusBadge } from "../components/custom/Badge";
import { Button } from "../components/custom/Button";
import { Modal } from "../components/custom/Modal";
import { ProjectCardSkeleton } from "../components/custom/Skeleton";
import {
  apiCreateProject,
  apiDeleteProject,
  apiListProjects,
  apiUpdateProject,
} from "../services/api";

// ─── Types ────────────────────────────────────────────────────────────────────

const PROJECT_COLORS = [
  "#8b5cf6",
  "#6366f1",
  "#3b82f6",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
  "#f97316",
  "#84cc16",
];

const defaultForm = {
  name: "",
  description: "",
  dueDate: "",
  status: "active",
  color: "#8b5cf6",
};

const STATUS_RIBBON = {
  active: "bg-primary",
  completed: "bg-emerald-500",
  archived: "bg-muted-foreground",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function AvatarStack({ members, max = 3 }) {
  const shown = members.slice(0, max);
  const extra = members.length - max;
  return (
    <div className="flex -space-x-2">
      {shown.map((m) => (
        <div key={m.id} className="relative group/avatar">
          <img
            src={
              m.user.avatar ??
              `https://api.dicebear.com/9.x/avataaars/svg?seed=${m.user.name}`
            }
            alt={m.user.name ?? "Team member"}
            className="h-7 w-7 rounded-full ring-2 ring-card object-cover transition-transform duration-200 group-hover/avatar:scale-110 group-hover/avatar:-translate-y-0.5"
          />
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 rounded-md bg-popover border border-border text-xs text-foreground whitespace-nowrap opacity-0 group-hover/avatar:opacity-100 pointer-events-none transition-opacity z-50 shadow-elevated">
            {m.user.name}
          </div>
        </div>
      ))}
      {extra > 0 && (
        <span className="h-7 w-7 rounded-full ring-2 ring-card bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">
          +{extra}
        </span>
      )}
    </div>
  );
}

function GradientProgressBar({ pct }) {
  return (
    <div className="h-1.5 rounded-full bg-muted/40 overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
        className={cn(
          "h-full rounded-full",
          pct === 100
            ? "bg-gradient-to-r from-emerald-400 to-emerald-600"
            : "bg-gradient-to-r from-primary to-accent",
        )}
      />
    </div>
  );
}

function ActionMenu({ project, onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        data-ocid="project-action-menu"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring opacity-0 group-hover:opacity-100"
        aria-label="Project actions"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            role="button"
            tabIndex={-1}
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
          />
          <div className="absolute right-0 top-8 z-20 w-40 glass-card-elevated border border-white/20 dark:border-white/10 py-1 rounded-xl overflow-hidden">
            <button
              type="button"
              data-ocid="project-edit-btn"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setOpen(false);
                onEdit(project);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted/50 transition-smooth"
            >
              <Edit3 className="h-3.5 w-3.5" /> Edit
            </button>
            <button
              type="button"
              data-ocid="project-delete-btn"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setOpen(false);
                onDelete(project);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-smooth"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function ProjectCard({ project, index, onEdit, onDelete }) {
  const dueLabel = project.dueDate
    ? new Date(project.dueDate).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
    : null;
  const isOverdue =
    project.dueDate &&
    new Date(project.dueDate) < new Date() &&
    project.status !== "completed";
  const pct =
    project.totalTasks === 0
      ? 0
      : Math.round((project.completedTasks / project.totalTasks) * 100);
  const accentColor = project.color ?? "#8b5cf6";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.05,
        type: "spring",
        stiffness: 260,
        damping: 20,
      }}
      className="h-full"
    >
      <Link to="/projects/$projectId" params={{ projectId: project.id }}>
        <div
          data-ocid={`project-card-${project.id}`}
          className="group relative h-full bg-card rounded-[24px] border border-border/50 dark:border-white/5 hover:border-primary/30 hover:dark:border-white/10 flex flex-col p-6 cursor-pointer shadow-2xl transition-all duration-500 overflow-hidden"
        >
          {/* Neon Glow Accent */}
          <div
            className="absolute -right-20 -top-20 w-48 h-48 blur-[80px] opacity-10 group-hover:opacity-30 transition-opacity duration-700 pointer-events-none"
            style={{ backgroundColor: accentColor }}
          />

          <div className="flex items-start gap-4 mb-6 relative z-10">
            {/* First Letter Logo */}


            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <h3 className="font-display font-bold text-lg text-foreground group-hover:text-primary transition-colors leading-tight truncate pr-2">
                  {project.name}
                </h3>
                <ActionMenu project={project} onEdit={onEdit} onDelete={onDelete} />
              </div>

              <div className="flex items-center gap-2 mt-1.5">
                <StatusBadge status={project.status} />
                {dueLabel && (
                  <span className={cn(
                    "flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg",
                    isOverdue ? "text-rose-400 bg-rose-500/10" : "text-muted-foreground bg-muted"
                  )}>
                    <Calendar className="h-2.5 w-2.5" /> {dueLabel}
                  </span>
                )}
              </div>
            </div>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2 mb-8 leading-relaxed relative z-10">
            {project.description || "Special mission project. Strictly monitored for quality and results."}
          </p>

          <div className="mt-auto space-y-4 relative z-10">
            <div className="flex items-center justify-between px-0.5">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-tight">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>{project.completedTasks} / {project.totalTasks} DONE</span>
              </div>
              <span className="text-sm font-black text-foreground">
                {pct}%
              </span>
            </div>

            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                className="h-full rounded-full"
                style={{
                  background: `linear-gradient(to right, ${accentColor}cc, ${accentColor})`,
                  boxShadow: `0 0 10px ${accentColor}aa`
                }}
              />
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between relative z-10">
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Collaborators</span>
              <AvatarStack members={project.members} />
            </div>

            <div className="h-10 w-10 rounded-xl bg-muted border border-border/50 flex items-center justify-center text-muted-foreground group-hover:text-foreground group-hover:bg-muted/80 transition-all duration-300">
              <FolderOpen size={18} />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function ProjectRow({ project, index, onEdit, onDelete }) {
  const dueLabel = project.dueDate
    ? new Date(project.dueDate).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
    : "—";
  const pct =
    project.totalTasks === 0
      ? 0
      : Math.round((project.completedTasks / project.totalTasks) * 100);
  const accentColor = project.color ?? "#8b5cf6";

  return (
    <motion.div
      initial={{ opacity: 0, x: -15 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03, type: "spring", stiffness: 300, damping: 25 }}
    >
      <Link to="/projects/$projectId" params={{ projectId: project.id }}>
        <div
          data-ocid={`project-row-${project.id}`}
          className="group grid grid-cols-[1.5fr,120px,160px,120px,120px,40px] items-center gap-6 px-6 py-4 rounded-2xl bg-card border border-border/50 hover:border-primary/30 dark:border-white/5 hover:bg-muted/30 transition-all cursor-pointer shadow-lg"
        >
          {/* Name Column */}
          <div className="flex items-center gap-4 min-w-0">
            <div
              className="h-10 w-10 rounded-xl flex items-center justify-center font-bold text-sm text-primary-foreground shadow-sm flex-shrink-0"
              style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}dd)` }}
            >
              {project.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <span className="font-display font-bold text-foreground group-hover:text-primary transition-colors block truncate leading-tight">
                {project.name}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter mt-0.5 block truncate">
                Modified {new Date(project.updatedAt || Date.now()).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Status Column */}
          <div className="flex justify-start">
            <StatusBadge status={project.status} />
          </div>

          {/* Progress Column */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: accentColor }} />
            </div>
            <span className="text-xs font-bold tabular-nums w-8 text-muted-foreground">
              {pct}%
            </span>
          </div>

          {/* Members Column */}
          <div className="hidden sm:flex justify-start">
            <AvatarStack members={project.members} max={3} />
          </div>

          {/* Due Column */}
          <div className="hidden lg:flex justify-start">
            <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
              <Calendar className="h-3 w-3" />
              {dueLabel}
            </span>
          </div>

          {/* Action Column */}
          <div className="flex justify-end">
            <ActionMenu project={project} onEdit={onEdit} onDelete={onDelete} />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Color Picker ─────────────────────────────────────────────────────────────

function ColorPicker({ value, onChange }) {
  return (
    <div>
      <p className="block text-sm font-medium text-foreground mb-1.5">
        Project Color
      </p>
      <div className="flex flex-wrap gap-2">
        {PROJECT_COLORS.map((c) => (
          <button
            type="button"
            key={c}
            onClick={() => onChange(c)}
            className={cn(
              "h-7 w-7 rounded-full transition-spring hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              value === c &&
              "ring-2 ring-offset-2 ring-offset-background scale-110",
            )}
            style={{ background: c }}
            aria-label={`Select color ${c}`}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Project Form Modal ───────────────────────────────────────────────────────

function ProjectFormModal({ open, onClose, initial, onSubmit, loading, mode }) {
  const [form, setForm] = useState(initial ?? defaultForm);
  useMemo(() => {
    if (open) setForm(initial ?? defaultForm);
  }, [open, initial]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const inputClass =
    "w-full rounded-xl bg-muted/40 border border-input px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-smooth";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === "create" ? "Create New Project" : "Edit Project"}
      description={
        mode === "create"
          ? "Add a new project to your workspace"
          : "Update project details"
      }
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            data-ocid="project-form-submit"
            loading={loading}
            onClick={() => onSubmit(form)}
            disabled={!form.name.trim()}
          >
            {mode === "create" ? "Create Project" : "Save Changes"}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <div>
          <label
            htmlFor="proj-name"
            className="block text-sm font-medium text-foreground mb-1.5"
          >
            Project Name <span className="text-destructive">*</span>
          </label>
          <input
            id="proj-name"
            data-ocid="project-name-input"
            className={inputClass}
            placeholder="Enter project name"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
          />
        </div>
        <div>
          <label
            htmlFor="proj-desc"
            className="block text-sm font-medium text-foreground mb-1.5"
          >
            Description
          </label>
          <textarea
            id="proj-desc"
            data-ocid="project-desc-input"
            className={cn(inputClass, "resize-none")}
            placeholder="Describe your project goals and scope"
            rows={3}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="proj-due"
              className="block text-sm font-medium text-foreground mb-1.5"
            >
              Due Date
            </label>
            <input
              id="proj-due"
              data-ocid="project-due-input"
              type="date"
              className={inputClass}
              value={form.dueDate}
              onChange={(e) => set("dueDate", e.target.value)}
            />
          </div>
          <div>
            <label
              htmlFor="proj-status"
              className="block text-sm font-medium text-foreground mb-1.5"
            >
              Status
            </label>
            <select
              id="proj-status"
              data-ocid="project-status-select"
              className={inputClass}
              value={form.status}
              onChange={(e) => set("status", e.target.value)}
            >
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
              <option value="on_hold">On Hold</option>
            </select>
          </div>
        </div>
        <ColorPicker value={form.color} onChange={(c) => set("color", c)} />
      </div>
    </Modal>
  );
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────

function DeleteConfirmModal({ project, onClose, onConfirm, loading }) {
  return (
    <Modal
      open={!!project}
      onClose={onClose}
      title="Delete Project"
      description="This action cannot be undone."
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            data-ocid="project-delete-confirm"
            variant="destructive"
            loading={loading}
            onClick={onConfirm}
          >
            Delete
          </Button>
        </>
      }
    >
      <p className="text-sm text-muted-foreground">
        Are you sure you want to delete{" "}
        <span className="font-semibold text-foreground">{project?.name}</span>?
        All tasks and members will be removed permanently.
      </p>
    </Modal>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const FILTER_TABS = [
  { key: "all", label: "All Projects" },
  { key: "active", label: "Active" },
  { key: "completed", label: "Completed" },
  { key: "archived", label: "Archived" },
];

export default function ProjectsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [view, setView] = useState("grid");
  const [createOpen, setCreateOpen] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [deleteProject, setDeleteProject] = useState(null);
  const [searchFocused, setSearchFocused] = useState(false);

  const { data: resp, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: () => apiListProjects(),
  });

  const projects = resp?.data ?? [];

  const filtered = useMemo(
    () =>
      projects.filter((p) => {
        const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
        const matchFilter = filter === "all" || p.status === filter;
        return matchSearch && matchFilter;
      }),
    [projects, search, filter],
  );

  const createMutation = useMutation({
    mutationFn: (f) =>
      apiCreateProject({
        name: f.name,
        description: f.description,
        dueDate: f.dueDate || undefined,
        color: f.color,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      setCreateOpen(false);
      toast.success("Project created successfully!");
    },
    onError: (err) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => apiUpdateProject(id, payload),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      // Also bust the per-project cache used by ProjectDetailPage
      qc.invalidateQueries({ queryKey: ["project", variables.id] });
      setEditProject(null);
      toast.success("Project updated!");
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => apiDeleteProject(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      setDeleteProject(null);
      toast.success("Project deleted.");
    },
    onError: (err) => toast.error(err.message),
  });

  const handleEdit = (form) => {
    if (!editProject) return;
    updateMutation.mutate({
      id: editProject.id,
      payload: {
        // Backend UPDATE query binds: $1=title, $2=description, $3=status, $4=due_date
        title: form.name,
        description: form.description,
        due_date: form.dueDate || undefined,
        status: form.status,
      },
    });
  };

  const editFormData = editProject
    ? {
      name: editProject.name,
      description: editProject.description,
      dueDate: editProject.dueDate
        ? editProject.dueDate.substring(0, 10)
        : "",
      status: editProject.status,
      color: editProject.color ?? PROJECT_COLORS[0],
    }
    : defaultForm;

  return (
    <>
      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-display font-bold gradient-text">Projects</h1>
          <p className="text-sm text-muted-foreground">Manage and track your team's initiatives</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div
            className={cn(
              "relative max-w-sm transition-all duration-500",
              searchFocused ? "w-64" : "w-48",
            )}
          >
            <Search
              className={cn(
                "absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 transition-colors duration-300",
                searchFocused ? "text-primary" : "text-muted-foreground",
              )}
            />
            <input
              data-ocid="projects-search"
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-muted/40 border border-border/50 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-muted/60 transition-all duration-300"
              placeholder="Quick find..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
          </div>

          <div className="flex items-center gap-2">
            {/* View toggle */}
            <div className="flex items-center gap-0.5 p-1 rounded-xl bg-muted/40 border border-border/50">
              <button
                type="button"
                data-ocid="view-toggle-grid"
                onClick={() => setView("grid")}
                className={cn(
                  "p-1.5 rounded-lg transition-all duration-200",
                  view === "grid"
                    ? "bg-primary text-primary-foreground shadow-subtle"
                    : "text-muted-foreground hover:text-foreground",
                )}
                aria-label="Grid view"
              >
                <Grid3X3 className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                data-ocid="view-toggle-list"
                onClick={() => setView("list")}
                className={cn(
                  "p-1.5 rounded-lg transition-all duration-200",
                  view === "list"
                    ? "bg-primary text-primary-foreground shadow-subtle"
                    : "text-muted-foreground hover:text-foreground",
                )}
                aria-label="List view"
              >
                <List className="h-3.5 w-3.5" />
              </button>
            </div>
            <Button
              data-ocid="new-project-btn"
              variant="hero"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => setCreateOpen(true)}
            >
              New Project
            </Button>
          </div>
        </div>
      </div>

      {/* Filter tabs — pill style */}
      <div className="mb-6 flex gap-1.5 flex-wrap">
        {FILTER_TABS.map((tab) => {
          const count =
            tab.key === "all"
              ? projects.length
              : projects.filter((p) => p.status === tab.key).length;
          const isActive = filter === tab.key;
          return (
            <button
              type="button"
              key={tab.key}
              data-ocid={`filter-tab-${tab.key}`}
              onClick={() => setFilter(tab.key)}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-glow-subtle"
                  : "bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted/60 border border-border/50",
              )}
            >
              {tab.label}
              <span
                className={cn(
                  "px-1.5 py-0.5 rounded-full text-[10px] font-bold",
                  isActive
                    ? "bg-white/20 text-primary-foreground"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn(
              view === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                : "flex flex-col gap-2",
            )}
          >
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <ProjectCardSkeleton key={i} />
            ))}
          </motion.div>
        ) : filtered.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            data-ocid="projects-empty-state"
            className="flex flex-col items-center justify-center py-28 text-center"
          >
            <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-5 shadow-glow-subtle">
              <FolderOpen className="h-10 w-10 text-primary" />
            </div>
            <h3 className="font-display font-semibold text-xl text-foreground mb-2">
              {search || filter !== "all"
                ? "No projects found"
                : "No projects yet"}
            </h3>
            <p className="text-muted-foreground text-sm max-w-xs mb-8 leading-relaxed">
              {search || filter !== "all"
                ? "Try adjusting your search or filters"
                : "Create your first project to start organizing your work"}
            </p>
            {!search && filter === "all" && (
              <Button
                variant="hero"
                leftIcon={<Plus className="h-4 w-4" />}
                onClick={() => setCreateOpen(true)}
              >
                Create your first project
              </Button>
            )}
          </motion.div>
        ) : view === "grid" ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {filtered.map((p, i) => (
              <ProjectCard
                key={p.id}
                project={p}
                index={i}
                onEdit={setEditProject}
                onDelete={setDeleteProject}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-2"
          >
            {/* List Header */}
            <div className="grid grid-cols-[1.5fr,120px,160px,120px,120px,40px] items-center gap-6 px-6 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 border-b border-border/10">
              <span>Project Name</span>
              <span>Status</span>
              <span className="hidden md:block">Current Progress</span>
              <span className="hidden sm:block">Team</span>
              <span className="hidden lg:block">Deadline</span>
              <span className="text-right">Ops</span>
            </div>

            {filtered.map((p, i) => (
              <ProjectRow
                key={p.id}
                project={p}
                index={i}
                onEdit={setEditProject}
                onDelete={setDeleteProject}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <ProjectFormModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        mode="create"
        onSubmit={(f) => createMutation.mutate(f)}
        loading={createMutation.isPending}
      />
      <ProjectFormModal
        open={!!editProject}
        onClose={() => setEditProject(null)}
        initial={editFormData}
        mode="edit"
        onSubmit={handleEdit}
        loading={updateMutation.isPending}
      />
      <DeleteConfirmModal
        project={deleteProject}
        onClose={() => setDeleteProject(null)}
        onConfirm={() =>
          deleteProject && deleteMutation.mutate(deleteProject.id)
        }
        loading={deleteMutation.isPending}
      />
    </>
  );
}
