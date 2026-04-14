import { cn } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Edit3,
  Flag,
  Hash,
  Kanban,
  Loader2,
  MessageSquare,
  Plus,
  Send,
  Trash2,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { PriorityBadge, StatusBadge } from "../components/custom/Badge";
import { Button } from "../components/custom/Button";
import { Modal } from "../components/custom/Modal";
import { TaskCardSkeleton } from "../components/custom/Skeleton";
import {
  apiCreateComment,
  apiCreateTask,
  apiDeleteComment,
  apiDeleteProject,
  apiDeleteTask,
  apiGetProject,
  apiInviteMember,
  apiListComments,
  apiListMembers,
  apiListTasks,
  apiListUsers,
  apiMoveTask,
  apiRemoveMember,
  apiUpdateTask,
} from "../services/api";

// ─── Column config ────────────────────────────────────────────────────────────

const COLUMNS = [
  {
    id: "todo",
    label: "To Do",
    accentColor: "border-t-blue-500",
    headerBg: "bg-blue-500/5",
    dotColor: "bg-blue-400",
    emptyText: "Nothing planned yet",
  },
  {
    id: "in_progress",
    label: "In Progress",
    accentColor: "border-t-amber-500",
    headerBg: "bg-amber-500/5",
    dotColor: "bg-amber-400",
    emptyText: "Nothing in progress",
  },
  {
    id: "done",
    label: "Done",
    accentColor: "border-t-emerald-500",
    headerBg: "bg-emerald-500/5",
    dotColor: "bg-emerald-400",
    emptyText: "No completed tasks",
  },
];

const PRIORITY_COLORS = {
  critical: "text-destructive bg-destructive/10 border-destructive/30",
  high: "text-orange-500 bg-orange-500/10 border-orange-500/30",
  medium: "text-amber-500 bg-amber-500/10 border-amber-500/30",
  low: "text-emerald-500 bg-emerald-500/10 border-emerald-500/30",
};
// ─── Tag chip colors ──────────────────────────────────────────────────────────

const TAG_COLORS = [
  "bg-primary/10 text-primary border-primary/20",
  "bg-accent/10 text-accent border-accent/20",
  "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
];

function tagColor(tag) {
  const idx = tag.charCodeAt(0) % TAG_COLORS.length;
  return TAG_COLORS[idx];
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({ name, src, size = "sm", showTooltip = false }) {
  const sizeClass = { sm: "h-6 w-6", md: "h-8 w-8", lg: "h-10 w-10" }[size];
  const fallback = `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(name)}`;
  return (
    <div className={cn("relative group/av flex-shrink-0", showTooltip && "")}>
      <img
        src={src ?? fallback}
        alt={name}
        className={cn(
          sizeClass,
          "rounded-full object-cover ring-1 ring-border",
        )}
      />
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 rounded-md bg-popover border border-border text-xs text-foreground whitespace-nowrap opacity-0 group-hover/av:opacity-100 pointer-events-none transition-opacity z-50 shadow-elevated">
          {name}
        </div>
      )}
    </div>
  );
}

// ─── Task Card ────────────────────────────────────────────────────────────────

function TaskCard({ task, onView, onMove }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const dueLabel = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : null;
  const isOverdue =
    task.dueDate &&
    new Date(task.dueDate) < new Date() &&
    task.status !== "done";
  const otherCols = COLUMNS.filter((c) => c.id !== task.status);
  const isCritical = task.priority === "critical";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.94, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -8 }}
      whileHover={{
        y: -2,
        transition: { type: "spring", stiffness: 400, damping: 30 },
      }}
      data-ocid={`task-card-${task.id}`}
      className={cn(
        "glass-card p-4 space-y-3 cursor-pointer transition-spring group",
        "hover:bg-white/[0.12] dark:hover:bg-white/[0.09] hover:border-white/30 dark:hover:border-white/15 hover:shadow-elevated",
        isCritical && "border-destructive/30 hover:border-destructive/50",
      )}
      onClick={() => onView(task)}
    >
      {/* Title row */}
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-medium text-sm text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors flex-1 min-w-0">
          {task.title}
        </h4>
        <div
          className="relative flex-shrink-0"
          role="presentation"
          onClick={(e) => {
            e.stopPropagation();
          }}
          onKeyDown={(e) => {
            e.stopPropagation();
          }}
        >
          <button
            type="button"
            data-ocid={`task-move-${task.id}`}
            className="flex items-center gap-0.5 text-xs text-muted-foreground hover:text-foreground px-1.5 py-1 rounded-md hover:bg-muted/60 transition-smooth"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((o) => !o);
            }}
            aria-label="Move task"
          >
            <ArrowRight className="h-3 w-3" />
            <ChevronDown className="h-2.5 w-2.5" />
          </button>
          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                role="button"
                tabIndex={-1}
                aria-label="Close menu"
                onClick={() => setMenuOpen(false)}
                onKeyDown={(e) => e.key === "Escape" && setMenuOpen(false)}
              />
              <div className="absolute right-0 top-8 z-20 w-36 glass-card-elevated border border-white/20 dark:border-white/10 py-1 rounded-xl overflow-hidden">
                {otherCols.map((col) => (
                  <button
                    type="button"
                    key={col.id}
                    className="flex w-full items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-muted/50 transition-smooth"
                    onClick={() => {
                      onMove(task, col.id);
                      setMenuOpen(false);
                    }}
                  >
                    <span
                      className={cn("h-1.5 w-1.5 rounded-full", col.dotColor)}
                    />
                    {col.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Badges row */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <PriorityBadge priority={task.priority} />
        {dueLabel && (
          <span
            className={cn(
              "flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border",
              isOverdue
                ? "text-destructive bg-destructive/10 border-destructive/30"
                : "text-muted-foreground bg-muted/30 border-border/40",
            )}
          >
            <Calendar className="h-2.5 w-2.5" /> {dueLabel}
          </span>
        )}
      </div>

      {/* Tags */}
      {task.tags?.length > 0 && (
        <div className="flex items-center gap-1 flex-wrap">
          {task.tags?.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className={cn(
                "px-1.5 py-0.5 rounded-md text-[10px] font-medium border",
                tagColor(tag),
              )}
            >
              <Hash className="h-2 w-2 inline mr-0.5 opacity-70" />
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer: assignee + comments */}
      <div className="flex items-center justify-between pt-2 border-t border-border/40">
        {task.assignee ? (
          <div className="flex items-center gap-1.5">
            <Avatar
              name={task.assignee.name}
              src={task.assignee.avatar}
              size="sm"
              showTooltip
            />
            <span className="text-[11px] text-muted-foreground truncate max-w-[80px]">
              {task.assignee.name.split(" ")[0]}
            </span>
          </div>
        ) : (
          <span className="text-[11px] text-muted-foreground/50">
            Unassigned
          </span>
        )}
        {task.comments > 0 && (
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <MessageSquare className="h-2.5 w-2.5" />
            {task.comments}
          </span>
        )}
      </div>
    </motion.div>
  );
}

// ─── Kanban Column ────────────────────────────────────────────────────────────

function KanbanCol({ col, tasks, onAddTask, onView, onMove }) {
  return (
    <div
      className={cn(
        "flex flex-col rounded-2xl border-t-[3px] glass-card",
        col.accentColor,
      )}
    >
      {/* Column header */}
      <div
        className={cn(
          "flex items-center justify-between px-4 py-3 border-b border-border/40 rounded-t-xl",
          col.headerBg,
        )}
      >
        <div className="flex items-center gap-2">
          <span className={cn("h-2 w-2 rounded-full", col.dotColor)} />
          <h3 className="font-display font-semibold text-sm text-foreground">
            {col.label}
          </h3>
          <motion.span
            key={tasks.length}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-muted text-muted-foreground min-w-[18px] text-center"
          >
            {tasks.length}
          </motion.span>
        </div>
        <button
          type="button"
          onClick={() => onAddTask(col.id)}
          className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-smooth"
          aria-label={`Add task to ${col.label}`}
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Task list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 max-h-[calc(100vh-400px)] min-h-[120px]">
        <AnimatePresence>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onView={onView}
              onMove={onMove}
            />
          ))}
        </AnimatePresence>
        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-border/30 rounded-xl gap-2">
            <Kanban className="h-5 w-5 text-muted-foreground/40" />
            <span className="text-xs text-muted-foreground/60">
              {col.emptyText}
            </span>
          </div>
        )}
      </div>

      {/* Add task footer */}
      <div className="p-3 pt-1">
        <button
          type="button"
          data-ocid={`add-task-${col.id}`}
          onClick={() => onAddTask(col.id)}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-dashed border-border/40 hover:border-border/70 transition-smooth"
        >
          <Plus className="h-3 w-3" /> Add Task
        </button>
      </div>
    </div>
  );
}

// ─── Task Form Modal ──────────────────────────────────────────────────────────

const defaultTaskForm = {
  title: "",
  description: "",
  priority: "medium",
  dueDate: "",
};
function TaskFormModal({
  open,
  onClose,
  onSubmit,
  loading,
  initialStatus,
  members,
  mode,
  initial,
}) {
  const [form, setForm] = useState(initial ?? defaultTaskForm);
  useMemo(() => {
    if (open) setForm(initial ?? defaultTaskForm);
  }, [open, initial]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const inputClass =
    "w-full rounded-xl bg-muted/40 border border-input px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-smooth";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === "create" ? "Add New Task" : "Edit Task"}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            data-ocid="task-form-submit"
            loading={loading}
            onClick={() => onSubmit(form)}
            disabled={!form.title.trim()}
          >
            {mode === "create" ? "Create Task" : "Save Changes"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label
            htmlFor="task-title"
            className="block text-sm font-medium text-foreground mb-1.5"
          >
            Title <span className="text-destructive">*</span>
          </label>
          <input
            id="task-title"
            data-ocid="task-title-input"
            className={inputClass}
            placeholder="Enter task title"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
          />
        </div>
        <div>
          <label
            htmlFor="task-desc"
            className="block text-sm font-medium text-foreground mb-1.5"
          >
            Description
          </label>
          <textarea
            id="task-desc"
            data-ocid="task-desc-input"
            className={cn(inputClass, "resize-none")}
            placeholder="Describe the task"
            rows={3}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="task-priority"
              className="block text-sm font-medium text-foreground mb-1.5"
            >
              Priority
            </label>
            {/* Priority selector with colored options */}
            <div className="flex flex-col gap-1.5">
              {["low", "medium", "high", "critical"].map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => set("priority", p)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-smooth",
                    form.priority === p
                      ? PRIORITY_COLORS[p]
                      : "border-border/50 text-muted-foreground hover:bg-muted/40",
                  )}
                >
                  <Flag className="h-3 w-3" />
                  <span className="capitalize">{p}</span>
                  {form.priority === p && (
                    <CheckCircle2 className="h-3 w-3 ml-auto" />
                  )}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <label
                htmlFor="task-due"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                Due Date
              </label>
              <input
                id="task-due"
                data-ocid="task-due-input"
                type="date"
                className={inputClass}
                value={form.dueDate}
                onChange={(e) => set("dueDate", e.target.value)}
              />
            </div>
            <div>
              <label
                htmlFor="task-assignee"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                Assignee
              </label>
              <select
                id="task-assignee"
                data-ocid="task-assignee-select"
                className={inputClass}
                value={form.assigneeId}
                onChange={(e) => set("assigneeId", e.target.value)}
              >
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.id} value={m.userId}>
                    {m.user.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        {mode === "create" && initialStatus && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 rounded-lg px-3 py-2 border border-border/40">
            <Kanban className="h-3.5 w-3.5" />
            Adding to:{" "}
            <span className="font-semibold text-foreground capitalize">
              {initialStatus.replace("_", " ")}
            </span>
          </div>
        )}
      </div>
    </Modal>
  );
}

// ─── Comment Section ──────────────────────────────────────────────────────────

function CommentSection({ taskId }) {
  const qc = useQueryClient();
  const [newComment, setNewComment] = useState("");
  const textareaRef = useRef(null);

  const { data: commentsResp, isLoading } = useQuery({
    queryKey: ["comments", taskId],
    queryFn: () => apiListComments(taskId),
  });
  const comments = commentsResp?.data ?? [];

  const createMutation = useMutation({
    mutationFn: (content) => apiCreateComment(taskId, content),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["comments", taskId] });
      qc.invalidateQueries({ queryKey: ["tasks"] });
      setNewComment("");
      textareaRef.current?.focus();
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (commentId) => apiDeleteComment(commentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["comments", taskId] });
      qc.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = () => {
    const trimmed = newComment.trim();
    if (!trimmed) return;
    createMutation.mutate(trimmed);
  };

  const formatCommentTime = (iso) => {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2 pb-2 border-b border-border/40">
        <MessageSquare className="h-4 w-4 text-primary" />
        <h4 className="text-sm font-semibold text-foreground">Comments</h4>
        {comments.length > 0 && (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
            {comments.length}
          </span>
        )}
      </div>

      {/* Comment list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-6 gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-xs">Loading comments…</span>
        </div>
      ) : comments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 gap-2 rounded-xl border border-dashed border-border/40 bg-muted/10">
          <MessageSquare className="h-7 w-7 text-muted-foreground/30" />
          <p className="text-xs text-muted-foreground/60">No comments yet</p>
          <p className="text-[10px] text-muted-foreground/40">
            Be the first to leave a comment
          </p>
        </div>
      ) : (
        <div
          data-ocid="comment-list"
          className="space-y-2.5 max-h-52 overflow-y-auto pr-1"
        >
          <AnimatePresence initial={false}>
            {comments.map((comment) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group flex gap-2.5 p-3 rounded-xl bg-muted/20 border border-border/30 hover:bg-muted/30 hover:border-border/50 transition-smooth"
              >
                <img
                  src={
                    comment.author.avatar ??
                    `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(comment.author.name)}`
                  }
                  alt={comment.author.name}
                  className="h-7 w-7 rounded-full object-cover ring-1 ring-border flex-shrink-0 mt-0.5"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-xs font-semibold text-foreground">
                      {comment.author.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground/70">
                      {formatCommentTime(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-foreground/80 leading-relaxed break-words">
                    {comment.content}
                  </p>
                </div>
                <button
                  type="button"
                  data-ocid={`delete-comment-${comment.id}`}
                  onClick={() => deleteMutation.mutate(comment.id)}
                  disabled={deleteMutation.isPending}
                  className="opacity-0 group-hover:opacity-100 flex-shrink-0 p-1 rounded-md text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-smooth self-start"
                  aria-label="Delete comment"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add comment input */}
      <div className="flex gap-2 pt-1">
        <textarea
          ref={textareaRef}
          data-ocid="comment-input"
          placeholder="Add a comment…"
          rows={2}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit();
          }}
          className="flex-1 resize-none rounded-xl bg-muted/30 border border-input px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-smooth"
        />
        <button
          type="button"
          data-ocid="comment-submit"
          disabled={!newComment.trim() || createMutation.isPending}
          onClick={handleSubmit}
          className="flex-shrink-0 self-end flex items-center justify-center h-9 w-9 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-smooth shadow-sm"
          aria-label="Post comment"
        >
          {createMutation.isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Send className="h-3.5 w-3.5" />
          )}
        </button>
      </div>
      <p className="text-[10px] text-muted-foreground/50">
        Press ⌘↵ or Ctrl↵ to submit
      </p>
    </div>
  );
}

// ─── Task Detail Modal ────────────────────────────────────────────────────────

function TaskDetailModal({ task, onClose, onEdit, onDelete }) {
  if (!task) return null;
  const dueLabel = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString("en-US", {
        weekday: "short",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "No due date";
  const isOverdue =
    task.dueDate &&
    new Date(task.dueDate) < new Date() &&
    task.status !== "done";

  return (
    <Modal
      open={!!task}
      onClose={onClose}
      size="lg"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button
            data-ocid="task-detail-delete"
            variant="destructive"
            size="sm"
            leftIcon={<Trash2 className="h-3.5 w-3.5" />}
            onClick={() => {
              onClose();
              onDelete(task);
            }}
          >
            Delete
          </Button>
          <Button
            data-ocid="task-detail-edit"
            size="sm"
            leftIcon={<Edit3 className="h-3.5 w-3.5" />}
            onClick={() => {
              onClose();
              onEdit(task);
            }}
          >
            Edit
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: details */}
        <div className="md:col-span-2 space-y-5">
          <div>
            <h2 className="font-display text-xl font-bold text-foreground mb-3 leading-snug">
              {task.title}
            </h2>
            <div className="flex items-center gap-2 flex-wrap">
              <PriorityBadge priority={task.priority} />
              <StatusBadge status={task.status} />
            </div>
          </div>

          {task.description && (
            <div className="bg-muted/20 rounded-xl p-4 border border-border/40">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Description
              </h4>
              <p className="text-sm text-foreground leading-relaxed">
                {task.description}
              </p>
            </div>
          )}

          {/* Due date */}
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0",
                isOverdue ? "bg-destructive/10" : "bg-muted/40",
              )}
            >
              <Calendar
                className={cn(
                  "h-4 w-4",
                  isOverdue ? "text-destructive" : "text-muted-foreground",
                )}
              />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">
                Due Date
              </p>
              <p
                className={cn(
                  "text-sm font-medium",
                  isOverdue ? "text-destructive" : "text-foreground",
                )}
              >
                {dueLabel}
                {isOverdue && (
                  <span className="ml-2 text-xs font-normal opacity-70">
                    (overdue)
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Tags */}
          {task.tags?.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Tags
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {task.tags?.map((tag) => (
                  <span
                    key={tag}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-xs font-medium border",
                      tagColor(tag),
                    )}
                  >
                    <Hash className="h-2.5 w-2.5 inline mr-0.5 opacity-70" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: people + meta */}
        <div className="space-y-4">
          {task.assignee && (
            <div className="bg-muted/20 rounded-xl p-3.5 border border-border/40 space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" /> Assignee
              </h4>
              <div className="flex items-center gap-2.5">
                <Avatar
                  name={task.assignee.name}
                  src={task.assignee.avatar}
                  size="md"
                />
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {task.assignee.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {task.assignee.email}
                  </p>
                </div>
              </div>
            </div>
          )}
          {task.reporter && (
            <div className="bg-muted/20 rounded-xl p-3.5 border border-border/40 space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" /> Created by
              </h4>
              <div className="flex items-center gap-2.5">
                <Avatar
                  name={task.reporter.name}
                  src={task.reporter.avatar}
                  size="md"
                />
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {task.reporter.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(task.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          )}
          <div className="bg-muted/20 rounded-xl p-3.5 border border-border/40 space-y-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Flag className="h-3.5 w-3.5" /> Priority
            </h4>
            <PriorityBadge priority={task.priority} />
          </div>
        </div>
      </div>

      {/* Comments — full width below the grid */}
      <div className="mt-6 pt-5 border-t border-border/40">
        <CommentSection taskId={task.id} />
      </div>
    </Modal>
  );
}

// ─── Members Panel ────────────────────────────────────────────────────────────

function MembersPanel({ projectId, members, onRemove, removingId }) {
  const qc = useQueryClient();
  const [searchUser, setSearchUser] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [role, setRole] = useState("member");

  const { data: usersResp } = useQuery({
    queryKey: ["users"],
    queryFn: () => apiListUsers(),
  });
  const allUsers = usersResp?.data ?? [];
  const existingUserIds = new Set(members.map((m) => m.userId));
  const availableUsers = allUsers.filter(
    (u) =>
      !existingUserIds.has(u.id) &&
      u.name.toLowerCase().includes(searchUser.toLowerCase()),
  );

  const inviteMutation = useMutation({
    mutationFn: () => {
      const user = allUsers.find((u) => u.id === selectedUserId);
      return apiInviteMember({ email: user?.email ?? "", role, projectId });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["members", projectId] });
      setSelectedUserId("");
      setSearchUser("");
      toast.success("Member invited!");
    },
    onError: (err) => toast.error(err.message),
  });

  const roleBadge = {
    admin: "bg-primary/10 text-primary border-primary/20",
    member: "bg-accent/10 text-accent border-accent/20",
    viewer: "bg-muted/10 text-muted-foreground border-border/50",
  };
  return (
    <div className="glass-card p-4 space-y-4">
      <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
        <Users className="h-4 w-4 text-primary" /> Team Members
        <span className="ml-auto text-xs font-normal text-muted-foreground bg-muted/40 px-2 py-0.5 rounded-full">
          {members.length}
        </span>
      </h3>

      {/* Add Member */}
      <div className="space-y-2 pb-3 border-b border-border/50">
        <div className="relative">
          <input
            data-ocid="member-search-input"
            className="w-full rounded-xl bg-muted/40 border border-input px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-smooth"
            placeholder="Search users to add..."
            value={searchUser}
            onChange={(e) => {
              setSearchUser(e.target.value);
              setSelectedUserId("");
            }}
          />
          {searchUser && !selectedUserId && availableUsers.length > 0 && (
            <div className="absolute top-full left-0 right-0 z-10 mt-1 glass-card-elevated border border-white/20 dark:border-white/10 rounded-xl py-1 max-h-32 overflow-y-auto">
              {availableUsers.map((u) => (
                <button
                  type="button"
                  key={u.id}
                  className="flex w-full items-center gap-2 px-3 py-2 text-xs hover:bg-muted/50 transition-smooth"
                  onClick={() => {
                    setSelectedUserId(u.id);
                    setSearchUser(u.name);
                  }}
                >
                  <Avatar name={u.name} src={u.avatar} size="sm" />
                  <span className="flex-1 text-left text-foreground">
                    {u.name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
        {selectedUserId && (
          <div className="flex gap-2">
            <select
              data-ocid="member-role-select"
              className="flex-1 rounded-xl bg-muted/40 border border-input px-2 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="viewer">Viewer</option>
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
            <Button
              data-ocid="invite-member-btn"
              size="sm"
              loading={inviteMutation.isPending}
              leftIcon={<UserPlus className="h-3 w-3" />}
              onClick={() => inviteMutation.mutate()}
            >
              Invite
            </Button>
          </div>
        )}
      </div>

      {/* Member list */}
      <div className="space-y-1.5 max-h-64 overflow-y-auto">
        {members.map((m) => (
          <div
            key={m.id}
            className="flex items-center gap-2.5 py-1.5 px-2 rounded-xl group hover:bg-muted/30 transition-smooth"
          >
            <Avatar name={m.user.name} src={m.user.avatar} size="md" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">
                {m.user.name}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">
                {m.user.email}
              </p>
            </div>
            <span
              className={cn(
                "px-1.5 py-0.5 rounded-md text-[10px] border font-semibold capitalize flex-shrink-0",
                roleBadge[m.role],
              )}
            >
              {m.role}
            </span>
            {m.role !== "admin" && (
              <button
                type="button"
                data-ocid={`remove-member-${m.id}`}
                disabled={removingId === m.id}
                onClick={() => onRemove(m)}
                className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-smooth"
                aria-label="Remove member"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Stats Card ───────────────────────────────────────────────────────────────

function StatsCard({ tasks }) {
  const total = tasks.length;
  const done = tasks.filter((t) => t.status === "done").length;
  const inProg = tasks.filter((t) => t.status === "in_progress").length;
  const todo = tasks.filter(
    (t) => t.status === "todo" || t.status === "backlog",
  ).length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  const stats = [
    {
      label: "Total",
      value: total,
      icon: <Flag className="h-3.5 w-3.5" />,
      colorClass: "text-foreground",
      bg: "bg-muted/30",
    },
    {
      label: "Done",
      value: done,
      icon: <CheckCircle2 className="h-3.5 w-3.5" />,
      colorClass: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Active",
      value: inProg,
      icon: <Clock className="h-3.5 w-3.5" />,
      colorClass: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      label: "To Do",
      value: todo,
      icon: <AlertCircle className="h-3.5 w-3.5" />,
      colorClass: "text-blue-500",
      bg: "bg-blue-500/10",
    },
  ];

  return (
    <div className="glass-card p-4 space-y-4">
      <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4 text-primary" /> Progress
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {stats.map((s) => (
          <div
            key={s.label}
            className={cn("rounded-xl p-3 border border-border/30", s.bg)}
          >
            <div
              className={cn(
                "flex items-center gap-1.5 text-xs mb-1",
                s.colorClass,
              )}
            >
              {s.icon}
              <span className="text-muted-foreground">{s.label}</span>
            </div>
            <p className="text-2xl font-bold text-foreground tabular-nums">
              {s.value}
            </p>
          </div>
        ))}
      </div>
      <div>
        <div className="flex justify-between text-xs text-muted-foreground mb-2">
          <span>Overall Progress</span>
          <span
            className={cn(
              "font-semibold tabular-nums",
              pct === 100 ? "text-emerald-500" : "text-foreground",
            )}
          >
            {pct}%
          </span>
        </div>
        <div className="h-2.5 rounded-full bg-muted/40 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={cn(
              "h-full rounded-full",
              pct === 100
                ? "bg-gradient-to-r from-emerald-400 to-emerald-600"
                : "bg-gradient-to-r from-primary via-accent to-primary",
            )}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Avatar stack for header ──────────────────────────────────────────────────

function HeaderAvatarStack({ members }) {
  const shown = members.slice(0, 5);
  const extra = members.length - 5;
  return (
    <div className="flex items-center -space-x-2">
      {shown.map((m) => (
        <div key={m.id} className="relative group/hav">
          <img
            src={
              m.user.avatar ??
              `https://api.dicebear.com/9.x/avataaars/svg?seed=${m.user.name}`
            }
            alt={m.user.name}
            className="h-7 w-7 rounded-full ring-2 ring-card object-cover transition-transform duration-200 group-hover/hav:scale-110 group-hover/hav:-translate-y-0.5"
          />
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 rounded-md bg-popover border border-border text-xs text-foreground whitespace-nowrap opacity-0 group-hover/hav:opacity-100 pointer-events-none transition-opacity z-50 shadow-elevated">
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

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProjectDetailPage() {
  const { projectId } = useParams({ strict: false });
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [viewTask, setViewTask] = useState(null);
  const [editTask, setEditTask] = useState(null);
  const [addTaskStatus, setAddTaskStatus] = useState(null);
  const [deleteTaskTarget, setDeleteTaskTarget] = useState(null);
  const [removingMemberId, setRemovingMemberId] = useState(null);

  const { data: projectResp, isLoading: projectLoading } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => apiGetProject(projectId),
  });
  const { data: tasksResp, isLoading: tasksLoading } = useQuery({
    queryKey: ["tasks", projectId],
    queryFn: () => apiListTasks(projectId),
  });
  const { data: membersResp } = useQuery({
    queryKey: ["members", projectId],
    queryFn: () => apiListMembers(projectId),
  });

  const project = projectResp?.data;
  const tasks = tasksResp?.data ?? [];
  const members = membersResp?.data ?? [];

  const kanbanCols = useMemo(
    () =>
      COLUMNS.map((col) => ({
        ...col,
        tasks: tasks.filter((t) => t.status === col.id),
      })),
    [tasks],
  );

  const createTaskMutation = useMutation({
    mutationFn: (payload) => apiCreateTask(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks", projectId] });
      qc.invalidateQueries({ queryKey: ["project", projectId] });
      setAddTaskStatus(null);
      toast.success("Task created!");
    },
    onError: (err) => toast.error(err.message),
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, payload }) => apiUpdateTask(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks", projectId] });
      setEditTask(null);
      toast.success("Task updated!");
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (id) => apiDeleteTask(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks", projectId] });
      qc.invalidateQueries({ queryKey: ["project", projectId] });
      setDeleteTaskTarget(null);
      toast.success("Task deleted.");
    },
    onError: (err) => toast.error(err.message),
  });

  const moveTaskMutation = useMutation({
    mutationFn: ({ id, status }) => apiMoveTask(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks", projectId] }),
    onError: (err) => toast.error(err.message),
  });

  const deleteProjectMutation = useMutation({
    mutationFn: () => apiDeleteProject(projectId),
    onSuccess: () => {
      toast.success("Project deleted.");
      navigate({ to: "/projects" });
    },
    onError: (err) => toast.error(err.message),
  });

  const removeMemberMutation = useMutation({
    mutationFn: (memberId) => apiRemoveMember(memberId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["members", projectId] });
      setRemovingMemberId(null);
      toast.success("Member removed.");
    },
    onError: (err) => {
      toast.error(err.message);
      setRemovingMemberId(null);
    },
  });

  const handleCreateTask = (form) => {
    createTaskMutation.mutate({
      title: form.title,
      description: form.description,
      priority: form.priority,
      status: addTaskStatus ?? "todo",
      projectId,
      assigneeId: form.assigneeId || undefined,
    });
  };

  const handleUpdateTask = (form) => {
    if (!editTask) return;
    updateTaskMutation.mutate({
      id: editTask.id,
      payload: {
        title: form.title,
        description: form.description,
        priority: form.priority,
        assigneeId: form.assigneeId || undefined,
      },
    });
  };

  const handleRemoveMember = (m) => {
    setRemovingMemberId(m.id);
    removeMemberMutation.mutate(m.id);
  };

  const editTaskFormData = editTask
    ? {
        title: editTask.title,
        description: editTask.description,
        priority: editTask.priority,
        dueDate: editTask.dueDate ? editTask.dueDate.substring(0, 10) : "",
        assigneeId: editTask.assigneeId ?? "",
      }
    : null;

  if (projectLoading) {
    return (
      <>
        <div className="space-y-6">
          <div className="h-8 w-64 animate-pulse rounded-lg bg-muted/60" />
          <div className="h-36 rounded-2xl animate-pulse bg-muted/40" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-3">
                {[1, 2, 3].map((j) => (
                  <TaskCardSkeleton key={j} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  if (!project) {
    return (
      <>
        <div className="flex flex-col items-center justify-center py-24">
          <p className="text-muted-foreground">Project not found.</p>
          <Link to="/projects">
            <Button variant="ghost" className="mt-4">
              Back to Projects
            </Button>
          </Link>
        </div>
      </>
    );
  }

  const dueLabel = project.dueDate
    ? new Date(project.dueDate).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "No due date";
  const accentColor = project.color ?? "#8b5cf6";
  const pct =
    project.totalTasks === 0
      ? 0
      : Math.round((project.completedTasks / project.totalTasks) * 100);

  return (
    <>
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
        <Link
          to="/projects"
          className="hover:text-foreground transition-colors"
        >
          Projects
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-medium truncate max-w-xs">
          {project.name}
        </span>
      </div>

      {/* Project header card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card mb-6 overflow-hidden"
        style={{ borderLeft: `4px solid ${accentColor}` }}
      >
        <div className="p-5">
          <div className="flex flex-col md:flex-row md:items-start gap-4">
            {/* Project icon */}
            <div
              className="h-14 w-14 rounded-2xl flex-shrink-0 flex items-center justify-center text-2xl font-bold text-white shadow-elevated"
              style={{
                background: `linear-gradient(135deg, ${accentColor}, ${accentColor}99)`,
              }}
            >
              {project.name.charAt(0).toUpperCase()}
            </div>

            {/* Project info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap mb-1.5">
                <h1 className="font-display text-2xl font-bold text-foreground">
                  {project.name}
                </h1>
                <StatusBadge status={project.status} />
              </div>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed max-w-xl">
                {project.description || "No description provided."}
              </p>
              <div className="flex items-center gap-5 text-xs text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  Due {dueLabel}
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" />
                  {members.length} member{members.length !== 1 ? "s" : ""}
                </span>
                <HeaderAvatarStack members={members} />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                data-ocid="project-detail-delete"
                variant="ghost"
                size="sm"
                leftIcon={<Trash2 className="h-3.5 w-3.5" />}
                onClick={() => deleteProjectMutation.mutate()}
                loading={deleteProjectMutation.isPending}
                className="text-muted-foreground hover:text-destructive"
              >
                Delete
              </Button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4 pt-4 border-t border-border/40">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {project.completedTasks}/{project.totalTasks} tasks completed
              </span>
              <span
                className={cn(
                  "font-semibold tabular-nums",
                  pct === 100 ? "text-emerald-500" : "text-foreground",
                )}
              >
                {pct}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-muted/40 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.9, ease: "easeOut", delay: 0.2 }}
                className={cn(
                  "h-full rounded-full",
                  pct === 100
                    ? "bg-gradient-to-r from-emerald-400 to-emerald-600"
                    : "bg-gradient-to-r from-primary to-accent",
                )}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Two-panel layout */}
      <div className="flex gap-5">
        {/* Kanban board */}
        <div className="flex-1 min-w-0">
          {tasksLoading ? (
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-3">
                  {[1, 2, 3].map((j) => (
                    <TaskCardSkeleton key={j} />
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {kanbanCols.map((col) => (
                <KanbanCol
                  key={col.id}
                  col={col}
                  tasks={col.tasks}
                  onAddTask={(status) => setAddTaskStatus(status)}
                  onView={setViewTask}
                  onMove={(t, s) =>
                    moveTaskMutation.mutate({ id: t.id, status: s })
                  }
                />
              ))}
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="hidden xl:flex flex-col gap-4 w-72 flex-shrink-0">
          <StatsCard tasks={tasks} />
          <MembersPanel
            projectId={projectId}
            members={members}
            onRemove={handleRemoveMember}
            removingId={removingMemberId}
          />
        </div>
      </div>

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={viewTask}
        onClose={() => setViewTask(null)}
        onEdit={(t) => {
          setViewTask(null);
          setEditTask(t);
        }}
        onDelete={(t) => setDeleteTaskTarget(t)}
      />

      {/* Add Task Modal */}
      <TaskFormModal
        open={!!addTaskStatus}
        onClose={() => setAddTaskStatus(null)}
        onSubmit={handleCreateTask}
        loading={createTaskMutation.isPending}
        initialStatus={addTaskStatus ?? undefined}
        members={members}
        mode="create"
      />

      {/* Edit Task Modal */}
      <TaskFormModal
        open={!!editTask}
        onClose={() => setEditTask(null)}
        onSubmit={handleUpdateTask}
        loading={updateTaskMutation.isPending}
        members={members}
        mode="edit"
        initial={editTaskFormData}
      />

      {/* Delete Task Confirm */}
      <Modal
        open={!!deleteTaskTarget}
        onClose={() => setDeleteTaskTarget(null)}
        title="Delete Task"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteTaskTarget(null)}>
              Cancel
            </Button>
            <Button
              data-ocid="task-delete-confirm"
              variant="destructive"
              loading={deleteTaskMutation.isPending}
              onClick={() =>
                deleteTaskTarget &&
                deleteTaskMutation.mutate(deleteTaskTarget.id)
              }
            >
              Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted-foreground">
          Delete{" "}
          <span className="font-semibold text-foreground">
            {deleteTaskTarget?.title}
          </span>
          ? This cannot be undone.
        </p>
      </Modal>
    </>
  );
}
