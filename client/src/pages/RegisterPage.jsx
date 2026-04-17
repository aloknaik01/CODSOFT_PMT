import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Sparkles,
  TrendingUp,
  User,
  Users,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import { APP_NAME } from "../constants";

const stats = [
  { value: "50K+", label: "Teams" },
  { value: "2M+", label: "Tasks done" },
  { value: "99.9%", label: "Uptime" },
];

const perks = [
  {
    icon: Sparkles,
    title: "AI-powered insights",
    desc: "Smart task prioritization that learns from your workflow.",
    color: "oklch(0.72 0.19 268)",
  },
  {
    icon: TrendingUp,
    title: "Visual progress tracking",
    desc: "Beautiful Kanban boards, Gantt charts, and sprint analytics.",
    color: "oklch(0.72 0.2 189)",
  },
  {
    icon: Users,
    title: "Unlimited collaborators",
    desc: "Invite your whole team on any plan — no per-seat surprises.",
    color: "oklch(0.72 0.18 142)",
  },
];

// 3-step form definition
const STEPS = [
  { id: 1, label: "Account" },
  { id: 2, label: "Security" },
  { id: 3, label: "Confirm" },
];

function AnimatedOrb({ className, color, delay = 0 }) {
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl pointer-events-none ${className}`}
      style={{ background: color }}
      animate={{ scale: [1, 1.18, 1], opacity: [0.15, 0.27, 0.15] }}
      transition={{
        duration: 7,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut",
        delay,
      }}
    />
  );
}

function LogoMark({ size = 40 }) {
  return (
    <motion.div
      className="relative flex-shrink-0"
      whileHover={{ scale: 1.08 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <img 
        src="/LumoPng.png" 
        alt="Lumo Logo" 
        style={{ width: size, height: 'auto' }}
        className="object-contain"
      />
    </motion.div>
  );
}

function StepIndicator({ current }) {
  return (
    <div className="flex items-center gap-2 justify-center">
      {STEPS.map((step, i) => (
        <div key={step.id} className="flex items-center gap-2">
          <motion.div
            animate={{
              scale: step.id === current ? 1.1 : 1,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="flex flex-col items-center gap-1"
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
              style={{
                background:
                  step.id < current
                    ? "oklch(var(--chart-3))"
                    : step.id === current
                      ? "linear-gradient(135deg, oklch(var(--primary)), oklch(var(--accent)))"
                      : "oklch(var(--muted))",
                color: step.id <= current ? "white" : "oklch(var(--muted-foreground))",
                boxShadow:
                  step.id === current
                    ? "0 0 16px oklch(var(--primary) / 0.4)"
                    : "none",
              }}
            >
              {step.id < current ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                step.id
              )}
            </div>
            <span
              className="text-[10px] font-medium transition-colors duration-300"
              style={{
                color:
                  step.id === current
                    ? "oklch(var(--primary))"
                    : "oklch(var(--muted-foreground))",
              }}
            >
              {step.label}
            </span>
          </motion.div>
          {i < STEPS.length - 1 && (
            <div
              className={`h-px w-8 mb-4 rounded-full transition-all duration-500 ${
                step.id < current ? "bg-emerald-500" : "bg-border"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export default function RegisterPage() {
  const { isAuthenticated, isLoading: authLoading, register } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [terms, setTerms] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [focusedField, setFocusedField] = useState(null);

  const strength =
    password.length === 0
      ? 0
      : password.length < 8
        ? 1
        : password.length < 12
          ? 2
          : 3;
  const strengthLabels = ["", "Weak", "Good", "Strong"];
  const strengthColors = [
    "",
    "oklch(0.62 0.2 27)",
    "oklch(0.75 0.15 70)",
    "oklch(0.72 0.18 142)",
  ];

  useEffect(() => {
    if (!authLoading && isAuthenticated) void navigate({ to: "/dashboard" });
  }, [isAuthenticated, authLoading, navigate]);

  const validate = (fields) => {
    const check = fields ?? [
      "name",
      "email",
      "password",
      "confirmPassword",
      "terms",
    ];
    const e = { ...errors };

    if (check.includes("name"))
      e.name = name.trim().length < 2 ? "Full name is required" : undefined;
    if (check.includes("email"))
      e.email = !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
        ? "Enter a valid email address"
        : undefined;
    if (check.includes("password"))
      e.password =
        password.length < 8
          ? "Password must be at least 8 characters"
          : undefined;
    if (check.includes("confirmPassword"))
      e.confirmPassword =
        confirmPassword !== password ? "Passwords do not match" : undefined;
    if (check.includes("terms"))
      e.terms = !terms ? "You must accept the terms to continue" : undefined;

    setErrors(e);
    return Object.values(e).every((v) => !v);
  };

  const goNext = () => {
    if (step === 1) {
      const ok = validate(["name", "email"]);
      if (ok) setStep(2);
    } else if (step === 2) {
      const ok = validate(["password", "confirmPassword"]);
      if (ok) setStep(3);
    }
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (step < 3) {
      goNext();
      return;
    }
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      await register({ name, email, password });
      toast.success("Account created 🎉");
      void navigate({ to: "/dashboard" });
    } catch {
      toast.error("Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = (field, hasError) =>
    `
    pl-10 h-12 rounded-xl border transition-all duration-200
    bg-background shadow-sm
    text-foreground placeholder:text-muted-foreground/50
    ${
      hasError
        ? "border-destructive/70 shadow-[0_0_0_3px_oklch(var(--destructive)/0.15)]"
        : focusedField === field
          ? "border-primary/60 shadow-[0_0_0_3px_oklch(var(--primary)/0.18)] bg-primary/[0.03]"
          : "border-border hover:border-border/80"
    }
  `.trim();

  return (
    <div className="min-h-screen flex overflow-hidden bg-background">
      {/* ── Left panel ─────────────────────────────────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-[52%] relative flex-col justify-between p-12 overflow-hidden border-r border-border/50"
        style={{
          background:
            "linear-gradient(145deg, oklch(var(--auth-bg-left)) 0%, oklch(var(--background)) 50%, oklch(var(--auth-bg-right)) 100%)",
        }}
      >
        <AnimatedOrb
          className="-top-20 -right-20 w-[420px] h-[420px]"
          color="oklch(var(--auth-orb-2))"
          delay={0}
        />
        <AnimatedOrb
          className="-bottom-24 -left-24 w-[500px] h-[500px]"
          color="oklch(var(--auth-orb-1))"
          delay={3}
        />
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.05] dark:opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(circle, currentColor 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3 relative z-10"
        >
          <LogoMark size={44} />
          <span className="text-2xl font-display font-bold text-foreground tracking-tight">
            {APP_NAME}
          </span>
        </motion.div>

        {/* Hero copy */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.12 }}
          className="relative z-10 space-y-7"
        >
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-accent/30 bg-accent/10 backdrop-blur-sm">
              <span
                className="w-1.5 h-1.5 rounded-full bg-accent"
              />
              <span
                className="text-xs font-medium text-accent"
              >
                Free forever for small teams
              </span>
            </div>
            <h1 className="text-5xl xl:text-6xl font-display font-bold leading-[1.1] text-foreground">
              Your team's new{" "}
              <span className="gradient-text-hero">superpower</span>
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              Join thousands of teams who ship faster, collaborate better, and
              stress less with {APP_NAME}.
            </p>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.28 + i * 0.08 }}
                className="glass-card p-4 text-center"
              >
                <p className="text-2xl font-display font-bold gradient-text">
                  {s.value}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Perks */}
          <div className="space-y-3">
            {perks.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.45, delay: 0.42 + i * 0.1 }}
                className="glass-card-hover p-4 flex items-start gap-4"
              >
                <div
                  className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    background: `${p.color} / 0.12`,
                    border: `1px solid ${p.color} / 0.2`,
                  }}
                >
                  <p.icon className="w-4.5 h-4.5" style={{ color: p.color }} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground/90">{p.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    {p.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Free tier notice */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.75 }}
          className="relative z-10 glass-card p-5 flex items-center gap-4 border-l-2 border-accent/50"
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-accent/10"
          >
            <Sparkles
              className="w-5 h-5 text-accent"
            />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              Free forever for small teams
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Up to 5 members, 10 projects. No credit card required.
            </p>
          </div>
        </motion.div>
      </div>

      {/* ── Right panel ────────────────────────────────────────────────────── */}
      <div
        className="flex-1 flex items-center justify-center p-6 sm:p-10 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(160deg, oklch(var(--auth-bg-right)) 0%, oklch(var(--background)) 100%)",
        }}
      >
        <div
          className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-10 pointer-events-none"
          style={{ background: "oklch(0.68 0.16 189)" }}
        />
        <div
          className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-3xl opacity-8 pointer-events-none"
          style={{ background: "oklch(0.72 0.19 268)" }}
        />

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08 }}
          className="w-full max-w-md relative z-10"
        >
          <div
            className="rounded-2xl border border-border/50 p-8 backdrop-blur-xl space-y-6 glass-card"
          >
            {/* Mobile logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="flex lg:hidden items-center gap-3 justify-center"
            >
              <LogoMark size={36} />
              <span className="text-xl font-display font-bold text-foreground">
                {APP_NAME}
              </span>
            </motion.div>

            {/* Heading */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.15 }}
              className="space-y-1.5"
            >
              <h2 className="text-2xl font-display font-bold text-foreground">
                Create your account
              </h2>
              <p className="text-sm text-muted-foreground">
                Start your 14-day free trial — no credit card required.
              </p>
            </motion.div>

            {/* Step indicator */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <StepIndicator current={step} />
            </motion.div>

            <form
              onSubmit={(e) => void handleSubmit(e)}
              className="space-y-4"
              data-ocid="register-form"
              noValidate
            >
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-4"
                  >
                    {/* Full name */}
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="reg-name"
                        className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                      >
                        Full name
                      </Label>
                      <div className="relative">
                        <User
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-colors duration-200"
                          style={{
                            color:
                              focusedField === "name"
                                ? "oklch(var(--primary))"
                                : "oklch(var(--muted-foreground))",
                          }}
                        />
                        <Input
                          id="reg-name"
                          data-ocid="register-name"
                          type="text"
                          placeholder="Jane Doe"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          onFocus={() => setFocusedField("name")}
                          onBlur={() => {
                            setFocusedField(null);
                            validate(["name"]);
                          }}
                          className={inputClass("name", !!errors.name)}
                          autoComplete="name"
                        />
                      </div>
                      <AnimatePresence>
                        {errors.name && (
                          <motion.p
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            className="text-xs text-destructive flex items-center gap-1"
                          >
                            <span className="inline-block w-1 h-1 rounded-full bg-destructive" />
                            {errors.name}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="reg-email"
                        className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                      >
                        Work email
                      </Label>
                      <div className="relative">
                        <Mail
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-colors duration-200"
                          style={{
                            color:
                              focusedField === "email"
                                ? "oklch(var(--primary))"
                                : "oklch(var(--muted-foreground))",
                          }}
                        />
                        <Input
                          id="reg-email"
                          data-ocid="register-email"
                          type="email"
                          placeholder="you@company.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          onFocus={() => setFocusedField("email")}
                          onBlur={() => {
                            setFocusedField(null);
                            validate(["email"]);
                          }}
                          className={inputClass("email", !!errors.email)}
                          autoComplete="email"
                        />
                      </div>
                      <AnimatePresence>
                        {errors.email && (
                          <motion.p
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            className="text-xs text-destructive flex items-center gap-1"
                          >
                            <span className="inline-block w-1 h-1 rounded-full bg-destructive" />
                            {errors.email}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-4"
                  >
                    {/* Password */}
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="reg-password"
                        className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                      >
                        Password
                      </Label>
                      <div className="relative">
                        <Lock
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-colors duration-200"
                          style={{
                            color:
                              focusedField === "password"
                                ? "oklch(var(--primary))"
                                : "oklch(var(--muted-foreground))",
                          }}
                        />
                        <Input
                          id="reg-password"
                          data-ocid="register-password"
                          type={showPass ? "text" : "password"}
                          placeholder="Min. 8 characters"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          onFocus={() => setFocusedField("password")}
                          onBlur={() => {
                            setFocusedField(null);
                            validate(["password"]);
                          }}
                          className={`${inputClass("password", !!errors.password)} pr-11`}
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPass((v) => !v)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-150"
                          aria-label={
                            showPass ? "Hide password" : "Show password"
                          }
                        >
                          {showPass ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      {/* Strength meter */}
                      {password.length > 0 && (
                        <div className="space-y-1.5 pt-0.5">
                          <div className="flex gap-1.5">
                            {[1, 2, 3].map((i) => (
                              <motion.div
                                key={i}
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: i <= strength ? 1 : 1 }}
                                className="h-1 flex-1 rounded-full transition-all duration-300 origin-left"
                                style={{
                                  background:
                                    i <= strength
                                      ? strengthColors[strength]
                                      : "oklch(var(--muted))",
                                }}
                              />
                            ))}
                          </div>
                          <p
                            className="text-xs transition-colors duration-300"
                            style={{
                              color:
                                strength > 0
                                  ? strengthColors[strength]
                                  : "oklch(var(--muted-foreground))",
                            }}
                          >
                            {strengthLabels[strength]}
                          </p>
                        </div>
                      )}
                      <AnimatePresence>
                        {errors.password && (
                          <motion.p
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            className="text-xs text-destructive flex items-center gap-1"
                          >
                            <span className="inline-block w-1 h-1 rounded-full bg-destructive" />
                            {errors.password}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Confirm password */}
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="reg-confirm"
                        className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                      >
                        Confirm password
                      </Label>
                      <div className="relative">
                        <Lock
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-colors duration-200"
                          style={{
                            color:
                              focusedField === "confirm"
                                ? "oklch(var(--primary))"
                                : "oklch(var(--muted-foreground))",
                          }}
                        />
                        <Input
                          id="reg-confirm"
                          data-ocid="register-confirm-password"
                          type={showConfirm ? "text" : "password"}
                          placeholder="Repeat your password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          onFocus={() => setFocusedField("confirm")}
                          onBlur={() => {
                            setFocusedField(null);
                            validate(["confirmPassword"]);
                          }}
                          className={`${inputClass("confirm", !!errors.confirmPassword)} pr-11`}
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirm((v) => !v)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-150"
                          aria-label={
                            showConfirm ? "Hide password" : "Show password"
                          }
                        >
                          {showConfirm ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      <AnimatePresence>
                        {errors.confirmPassword && (
                          <motion.p
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            className="text-xs text-destructive flex items-center gap-1"
                          >
                            <span className="inline-block w-1 h-1 rounded-full bg-destructive" />
                            {errors.confirmPassword}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-4"
                  >
                    {/* Review summary */}
                    <div
                      className="rounded-xl p-4 space-y-3 border border-border/50 bg-muted/30"
                    >
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Account summary
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Name</span>
                          <span className="text-sm font-medium text-foreground">
                            {name}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Email</span>
                          <span className="text-sm font-medium text-foreground truncate max-w-[180px]">
                            {email}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            Password
                          </span>
                          <span className="text-sm font-medium text-foreground">
                            {"•".repeat(Math.min(password.length, 10))}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="text-xs text-primary/70 hover:text-primary transition-colors duration-150 hover:underline underline-offset-2"
                      >
                        Edit details
                      </button>
                    </div>

                    {/* Terms */}
                    <div className="space-y-1">
                      <div className="flex items-start gap-2.5">
                        <Checkbox
                          id="reg-terms"
                          data-ocid="register-terms"
                          checked={terms}
                          onCheckedChange={(v) => setTerms(!!v)}
                          className="mt-0.5 border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                        <Label
                          htmlFor="reg-terms"
                          className="text-sm text-muted-foreground cursor-pointer leading-relaxed"
                        >
                          I agree to the{" "}
                          <span className="text-primary hover:underline cursor-pointer underline-offset-2">
                            Terms of Service
                          </span>{" "}
                          and{" "}
                          <span className="text-primary hover:underline cursor-pointer underline-offset-2">
                            Privacy Policy
                          </span>
                        </Label>
                      </div>
                      <AnimatePresence>
                        {errors.terms && (
                          <motion.p
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            className="text-xs text-destructive pl-6 flex items-center gap-1"
                          >
                            <span className="inline-block w-1 h-1 rounded-full bg-destructive" />
                            {errors.terms}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation buttons */}
              <div
                className={`flex gap-3 pt-1 ${step === 1 ? "" : "flex-row"}`}
              >
                {step > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep((s) => s - 1)}
                    className="flex-1 h-12 rounded-xl border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
                  >
                    Back
                  </Button>
                )}
                <Button
                  type="submit"
                  data-ocid={step === 3 ? "register-submit" : "register-next"}
                  disabled={isSubmitting}
                  className={`h-12 rounded-xl font-semibold text-white border-0 transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5 active:translate-y-0 group ${step === 1 ? "w-full" : "flex-1"}`}
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.68 0.16 189), oklch(0.65 0.18 230), oklch(0.72 0.19 268))",
                    boxShadow: "0 4px 24px oklch(0.68 0.16 189 / 0.3)",
                  }}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="animate-spin w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8H4z"
                        />
                      </svg>
                      Creating account…
                    </span>
                  ) : step < 3 ? (
                    <span className="flex items-center justify-center gap-2">
                      Continue
                      <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Create account
                      <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </span>
                  )}
                </Button>
              </div>
            </form>

            {/* Sign in link */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.5 }}
              className="text-center text-sm text-muted-foreground"
            >
              Already using {APP_NAME}?{" "}
              <Link
                to="/login"
                data-ocid="login-link"
                className="text-primary font-semibold hover:text-primary/80 transition-colors duration-150 hover:underline underline-offset-2"
              >
                Sign in
              </Link>
            </motion.p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
