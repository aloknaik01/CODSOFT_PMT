import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  AlertTriangle,
  Calendar,
  CheckSquare,
  Clock,
  Crown,
  Eye,
  FolderOpen,
  Mail,
  Search,
  Shield,
  Sparkles,
  Trash2,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  apiInviteMember,
  apiListProjects,
  apiListTasks,
  apiListUsers,
  apiRemoveMember,
  apiUpdateMemberRole,
} from "../services/api";
import { Modal } from "../components/custom/Modal";

// ─── Role config ──────────────────────────────────────────────────────────────

const ROLE_CFG = {
  owner: {
    label: "Owner",
    color: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    bgGlow: "from-purple-500/5",
    icon: Crown,
    desc: "Full access, manage members & settings",
  },
  admin: {
    label: "Admin",
    color: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
    bgGlow: "from-indigo-500/5",
    icon: Shield,
    desc: "Management access, invite & remove members",
  },
  member: {
    label: "Member",
    color: "bg-primary/15 text-primary border-primary/30",
    bgGlow: "from-primary/5",
    icon: Shield,
    desc: "Create & edit tasks, comment on projects",
  },
  viewer: {
    label: "Viewer",
    color: "bg-muted/60 text-muted-foreground border-border",
    bgGlow: "from-muted/20",
    icon: Eye,
    desc: "Read-only access to projects & tasks",
  },
};

const getRoleCfg = (role) => ROLE_CFG[role] || ROLE_CFG.member;

function RoleBadge({ role }) {
  const { label, color, icon: Icon } = getRoleCfg(role);
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-semibold border ${color}`}
    >
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}

function MemberAvatar({ name, avatar, size = "md", isOwner }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const sz = {
    md: "w-14 h-14 text-lg",
    lg: "w-20 h-20 text-2xl",
  };
  const sizeClass = sz[size] ?? sz.md;
  const ring = isOwner
    ? "ring-2 ring-purple-400/60 ring-offset-2 ring-offset-card"
    : "ring-2 ring-primary/20";
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
      className={`${sizeClass} rounded-full bg-gradient-to-br from-primary/80 to-accent/80 flex items-center justify-center font-bold font-display text-primary-foreground ${ring}`}
    >
      {initials}
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, sub, color = "primary" }) {
  const colorMap = {
    primary: "bg-primary/15 text-primary",
    purple: "bg-purple-500/15 text-purple-400",
    emerald: "bg-emerald-500/15 text-emerald-400",
  };
  return (
    <div className="glass-card-elevated p-5 flex items-center gap-4 transition-spring hover:-translate-y-0.5 hover:shadow-glow-subtle">
      <div
        className={`w-11 h-11 rounded-xl ${colorMap[color]} flex items-center justify-center shrink-0`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-bold font-display">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
        {sub && (
          <p className="text-xs text-muted-foreground/60 mt-0.5">{sub}</p>
        )}
      </div>
    </div>
  );
}

// ─── Member Card ──────────────────────────────────────────────────────────────

function MemberCard({ member, onView, onRemove }) {
  const isOwner = member.role === "admin" || member.role === "owner";
  const { label } = getRoleCfg(member.role);

  // Format current time as a placeholder for "local time"
  const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <motion.div
      className="relative flex flex-col bg-card rounded-[32px] overflow-hidden border border-border/50 dark:border-white/5 shadow-2xl group min-h-[280px]"
      data-ocid="team-member-card"
      whileHover={{ y: -8, scale: 1.01 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Top Header Row */}
      <div className="flex items-center justify-between px-6 pt-6 mb-8 text-muted-foreground text-[13px] font-medium">
        <span className="flex items-center gap-2">
          {label}
        </span>
        <span className="flex items-center gap-1.5 opacity-60">
          <Clock size={14} /> {currentTime}
        </span>
      </div>

      {/* Profile Section */}
      <div className="px-6 flex items-center gap-4 mb-8">
        <div className="relative">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-border/50 bg-muted">
            {member.avatar ? (
              <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xl font-bold text-primary bg-primary/10">
                {member.name.charAt(0)}
              </div>
            )}
          </div>
          <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-[#70E000] border-[3px] border-card" />
        </div>
        <div className="flex flex-col">
          <h3 className="text-foreground text-lg font-bold tracking-tight">
            {member.name}
          </h3>
          <span className="text-[#70E000] text-sm flex items-center gap-1.5 font-medium mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#70E000]" />
            Active now
          </span>
        </div>
      </div>

      {/* Button Actions */}
      <div className="px-6 flex gap-3 mb-6 mt-auto">
        <button
          onClick={onView}
          className="flex-1 h-12 rounded-2xl bg-muted/50 hover:bg-muted/80 text-foreground font-semibold text-sm flex items-center justify-center gap-2 transition-all border border-border/50 active:scale-95"
        >
          <Sparkles size={16} /> View Stats
        </button>
        <button
          onClick={() => {
            navigator.clipboard.writeText(member.email);
            toast.success("Email copied to clipboard");
          }}
          className="flex-1 h-12 rounded-2xl bg-muted/50 hover:bg-muted/80 text-foreground font-semibold text-sm flex items-center justify-center gap-2 transition-all border border-border/50 active:scale-95"
        >
          <Mail size={16} /> Copy Email
        </button>
      </div>

      {/* Footer Stats / Special Mission Area */}
      <div className="bg-[#2979FF] shadow-[0_0_25px_rgba(41,121,255,0.4)] py-4 px-6 flex items-center justify-center gap-6 relative overflow-hidden">
        {/* Subtle inner glow */}
        <div className="absolute inset-x-0 top-0 h-px bg-white/20" />
        
        <div className="flex items-center gap-2 text-[#0A0A0A] font-bold text-[13px] relative z-10">
          <FolderOpen size={16} />
          {member.projectCount} Projects
        </div>
        <div className="w-1.5 h-1.5 rounded-full bg-[#0A0A0A] opacity-20 relative z-10" />
        <div className="flex items-center gap-2 text-[#0A0A0A] font-bold text-[13px] relative z-10">
          <CheckSquare size={16} />
          {member.taskCount} Tasks
        </div>
      </div>
    </motion.div>
  );
}

// ─── Invite Modal ─────────────────────────────────────────────────────────────

function InviteModal({ open, onClose, projects }) {
  const qc = useQueryClient();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [projectId, setProjectId] = useState("");

  // Reset form when modal opens
  useMemo(() => {
    if (open) {
      setEmail("");
      setRole("member");
      // Pre-select first project if available
      setProjectId(projects?.[0]?.id ?? "");
    }
  }, [open, projects]);

  const mutation = useMutation({
    mutationFn: () => apiInviteMember({ email, role, projectId }),
    onSuccess: () => {
      toast.success(`Invitation sent to ${email}!`);
      qc.invalidateQueries({ queryKey: ["teamMembers"] });
      qc.invalidateQueries({ queryKey: ["members", projectId] });
      onClose();
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Invite Member"
      description="Add someone to your team"
      size="md"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 border border-border rounded-xl py-2.5 text-sm font-semibold hover:bg-muted transition-smooth"
          >
            Cancel
          </button>
          <button
            type="button"
            data-ocid="invite-submit-btn"
            onClick={() => mutation.mutate()}
            disabled={!email || !projectId || mutation.isPending}
            className="flex-1 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-xl py-2.5 text-sm font-semibold hover:opacity-90 hover:shadow-glow disabled:opacity-50 transition-spring hover:-translate-y-0.5"
          >
            {mutation.isPending ? "Sending..." : "Send Invite"}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Project selector */}
        <div>
          <label
            htmlFor="invite-project"
            className="text-sm font-semibold mb-2 block"
          >
            Project <span className="text-destructive">*</span>
          </label>
          <select
            id="invite-project"
            data-ocid="invite-project-select"
            className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-smooth"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
          >
            <option value="">Select a project…</option>
            {(projects ?? []).map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="invite-email"
            className="text-sm font-semibold mb-2 block"
          >
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              id="invite-email"
              data-ocid="invite-email-input"
              type="email"
              placeholder="colleague@company.com"
              className="w-full bg-muted/30 border border-border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-smooth"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold mb-2">Role</p>
          <div className="grid grid-cols-2 gap-2.5">
            {["member", "viewer"].map((r) => {
              const { label, icon: Icon, color } = ROLE_CFG[r];
              const selected = role === r;
              return (
                <button
                  type="button"
                  key={r}
                  data-ocid={`invite-role-${r}`}
                  onClick={() => setRole(r)}
                  className={`flex items-center gap-2.5 p-3.5 rounded-xl border text-sm font-semibold transition-spring ${selected
                    ? `${color} shadow-glow-subtle scale-[1.02]`
                    : "border-border hover:border-primary/30 hover:bg-muted/30"
                    }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
}

// ─── Role Selector ────────────────────────────────────────────────────────────

function RoleSelector({ memberId, currentRole, onRoleChange }) {
  const [role, setRole] = useState(currentRole);
  const [isChanging, setIsChanging] = useState(false);
  const mutation = useMutation({
    mutationFn: (newRole) => apiUpdateMemberRole(memberId, newRole),
    onMutate: (newRole) => {
      setIsChanging(true);
      setRole(newRole);
    },
    onSuccess: (_, newRole) => {
      toast.success("Role updated successfully");
      onRoleChange(newRole);
      setIsChanging(false);
    },
    onError: (e) => {
      toast.error(e.message ?? "Failed to update role");
      setRole(currentRole);
      setIsChanging(false);
    },
  });

  return (
    <div>
      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2.5">
        Role
      </p>
      <div className="grid grid-cols-3 gap-2" data-ocid="role-selector">
        {Object.keys(ROLE_CFG).map((r) => {
          const { label, icon: Icon, color } = ROLE_CFG[r];
          const isSelected = role === r;
          return (
            <button
              key={r}
              type="button"
              data-ocid={`role-option-${r}`}
              disabled={mutation.isPending}
              onClick={() => {
                if (r !== role) mutation.mutate(r);
              }}
              className={`relative flex flex-col items-center gap-1.5 py-2.5 px-1 rounded-xl border text-xs font-semibold transition-spring disabled:cursor-not-allowed disabled:opacity-60
                ${isSelected ? `${color} shadow-glow-subtle scale-[1.04]` : "border-border hover:border-primary/30 hover:bg-muted/30"}`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              {label}
              {isSelected && isChanging && (
                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Member Detail Panel ──────────────────────────────────────────────────────

function DetailPanel({
  open,
  member,
  taskCount,
  projectCount,
  onClose,
  onRoleChange,
}) {
  if (!member?.role) return null;
  const isOwner = member.role === "admin" || member.role === "owner";
  const { bgGlow } = getRoleCfg(member.role);

  return (
    <motion.div
      initial={{ x: "100%", opacity: 0 }}
      animate={open ? { x: 0, opacity: 1 } : { x: "100%", opacity: 0 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed right-0 top-0 h-full w-80 bg-card/90 backdrop-blur-xl border-l border-border z-40 overflow-y-auto shadow-premium"
    >
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-bold font-display">Member Details</h3>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-smooth text-muted-foreground hover:text-foreground"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-muted/20 border border-border/50 p-5 text-center space-y-3">
          <div
            className={`absolute inset-0 bg-gradient-to-b ${bgGlow} to-transparent pointer-events-none`}
          />
          <div className="relative flex justify-center">
            <MemberAvatar
              name={member.name}
              avatar={member.avatar}
              size="lg"
              isOwner={isOwner}
            />
          </div>
          <div className="relative">
            <h2 className="font-bold font-display text-lg">{member.name}</h2>
            <p className="text-sm text-muted-foreground">{member.email}</p>
          </div>
          <div className="relative flex justify-center">
            <RoleBadge role={member.role} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Projects", value: projectCount, icon: FolderOpen },
            { label: "Tasks", value: taskCount, icon: CheckSquare },
          ].map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="p-3.5 rounded-xl bg-muted/20 border border-border/50 text-center"
            >
              <Icon className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
              <p className="text-xl font-bold font-display">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        <div className="p-3.5 rounded-xl bg-muted/20 border border-border/50 flex items-center gap-3">
          <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">Member since</p>
            <p className="text-sm font-semibold">
              {new Date(member.createdAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-muted/20 border border-border/50">
          <RoleSelector
            memberId={member.id}
            currentRole={member.role}
            onRoleChange={onRoleChange}
          />
        </div>

        <div>
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">
            Recent Activity
          </h4>
          <div className="space-y-2.5">
            {[
              "Completed 'API Integration Refactor'",
              "Updated task priority to High",
              "Commented on 'Implement New Auth'",
            ].map((a, i) => (
              <motion.div
                key={a}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex items-start gap-2.5 text-xs"
              >
                <div className="w-5 h-5 rounded-lg bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
                  <Activity className="w-2.5 h-2.5 text-primary" />
                </div>
                <span className="text-muted-foreground leading-relaxed">
                  {a}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Remove Dialog ────────────────────────────────────────────────────────────

function RemoveDialog({ open, member, onConfirm, onClose }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Remove Member?"
      description="This action cannot be undone"
      size="sm"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 border border-border rounded-xl py-2.5 text-sm font-semibold hover:bg-muted transition-smooth"
          >
            Cancel
          </button>
          <button
            type="button"
            data-ocid="team-confirm-remove-btn"
            onClick={onConfirm}
            className="flex-1 bg-destructive text-destructive-foreground rounded-xl py-2.5 text-sm font-semibold hover:opacity-90 transition-smooth"
          >
            Remove
          </button>
        </>
      }
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-destructive/15 flex items-center justify-center">
          <AlertTriangle className="w-5 h-5 text-destructive" />
        </div>
        <div>
          <p className="text-sm font-semibold">Confirm removal</p>
        </div>
      </div>
      <p className="text-sm text-muted-foreground pl-1">
        Are you sure you want to remove{" "}
        <strong className="text-foreground">{member.name}</strong>? They'll
        lose access to all projects immediately.
      </p>
    </Modal>
  );
}

// ─── TeamPage ─────────────────────────────────────────────────────────────────

export default function TeamPage() {
  const qc = useQueryClient();
  const [showInvite, setShowInvite] = useState(false);
  const [selected, setSelected] = useState(null);
  const [removing, setRemoving] = useState(null);
  const [search, setSearch] = useState("");

  const { data: usersData } = useQuery({
    queryKey: ["teamMembers"],
    queryFn: () => apiListUsers(),
  });
  const { data: tasksData } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => apiListTasks(),
  });
  const { data: projData } = useQuery({
    queryKey: ["projects"],
    queryFn: () => apiListProjects(),
  });

  const removeMutation = useMutation({
    mutationFn: () => apiRemoveMember(removing?.id ?? ""),
    onSuccess: () => {
      toast.success(`${removing?.name} has been removed.`);
      qc.invalidateQueries({ queryKey: ["teamMembers"] });
      setRemoving(null);
    },
    onError: () => toast.error("Failed to remove member"),
  });

  const users = usersData?.data ?? [];
  const tasks = tasksData?.data ?? [];
  const projects = projData?.data ?? [];
  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  const admins = users.filter((u) => u.role === "admin").length;
  const members = users.filter((u) => u.role === "member").length;
  const getTaskCount = (uid) =>
    tasks.filter((t) => t.assigneeId === uid).length;
  const getProjectCount = (uid) =>
    projects.filter((p) => p.members?.some((m) => m.userId === uid)).length;

  return (
    <>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold font-display gradient-text">
              Team Members
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {users.length} people collaborate on your workspace
            </p>
          </div>
          <button
            type="button"
            data-ocid="team-invite-btn"
            onClick={() => setShowInvite(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-primary to-accent text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 hover:shadow-glow transition-spring hover:-translate-y-0.5 shadow-elevated"
          >
            <UserPlus className="w-4 h-4" /> Invite Member
          </button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <StatCard
            icon={Users}
            label="Total Members"
            value={users.length}
            color="primary"
          />
          <StatCard
            icon={Activity}
            label="Active Now"
            value={Math.max(1, Math.floor(users.length * 0.15 + Math.random() * 2))}
            sub="Online today"
            color="emerald"
          />
          <StatCard icon={Crown} label="Admins" value={admins} color="purple" />
          <StatCard
            icon={Shield}
            label="Members"
            value={members}
            color="muted"
          />
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="relative max-w-sm"
        >
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            data-ocid="team-search-input"
            placeholder="Search members by name or email..."
            className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-smooth placeholder:text-muted-foreground/50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </motion.div>

        {/* Member Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <AnimatePresence>
            {filtered.map((member, i) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 16, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{
                  delay: i * 0.06,
                  type: "spring",
                  stiffness: 300,
                  damping: 24,
                }}
              >
                <MemberCard
                  member={member}
                  onView={() => setSelected(member)}
                  onRemove={() => setRemoving(member)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card-elevated p-16 text-center"
            data-ocid="team-empty-state"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-primary/50" />
            </div>
            <h3 className="font-display font-bold text-lg mb-2">
              {search ? "No members found" : "No team members yet"}
            </h3>
            <p className="text-muted-foreground text-sm mb-6 max-w-xs mx-auto">
              {search
                ? "Try a different search term or invite someone new."
                : "Start building your dream team by inviting your first member."}
            </p>
            <button
              type="button"
              onClick={() => setShowInvite(true)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-accent text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 hover:shadow-glow transition-spring hover:-translate-y-0.5"
            >
              <Sparkles className="w-4 h-4" /> Invite First Member
            </button>
          </motion.div>
        )}

        {/* Role Permissions */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass-card-elevated p-5"
        >
          <h3 className="text-sm font-bold text-muted-foreground mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4" /> Role Permissions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {Object.entries(ROLE_CFG).map(
              ([role, { label, icon: Icon, color, desc }]) => (
                <div
                  key={role}
                  className="flex items-start gap-3 p-4 rounded-xl bg-muted/20 border border-border/50"
                >
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-semibold shrink-0 ${color}`}
                  >
                    <Icon className="w-3 h-3" />
                    {label}
                  </span>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {desc}
                  </p>
                </div>
              ),
            )}
          </div>
        </motion.div>
      </div>

      <InviteModal open={showInvite} onClose={() => setShowInvite(false)} projects={projects} />
      <DetailPanel
        open={!!selected}
        member={selected || {}}
        taskCount={selected ? getTaskCount(selected.id) : 0}
        projectCount={selected ? getProjectCount(selected.id) : 0}
        onClose={() => setSelected(null)}
        onRoleChange={(newRole) =>
          setSelected((prev) => (prev ? { ...prev, role: newRole } : prev))
        }
      />
      <RemoveDialog
        open={!!removing}
        member={removing || {}}
        onConfirm={() => removeMutation.mutate()}
        onClose={() => setRemoving(null)}
      />
    </>
  );
}
