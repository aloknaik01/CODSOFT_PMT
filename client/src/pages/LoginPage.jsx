import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "@tanstack/react-router";

import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Shield,
  Users,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import { APP_NAME } from "../constants";

const features = [
  {
    icon: Shield,
    title: "Enterprise-grade Security",
    desc: "End-to-end encryption and SOC 2 compliance keep your data safe.",
    color: "oklch(0.72 0.19 268)",
  },
  {
    icon: Zap,
    title: "Blazing Fast Performance",
    desc: "Real-time updates and instant sync across your entire team.",
    color: "oklch(0.72 0.2 189)",
  },
  {
    icon: Users,
    title: "Built for Collaboration",
    desc: "Work seamlessly with your team — wherever they are in the world.",
    color: "oklch(0.72 0.18 142)",
  },
];

function AnimatedOrb({ className, color, delay = 0 }) {
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl pointer-events-none ${className}`}
      style={{ background: color }}
      animate={{
        scale: [1, 1.15, 1],
        opacity: [0.15, 0.25, 0.15],
      }}
      transition={{
        duration: 6,
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

export default function LoginPage() {
  const { isAuthenticated, isLoading: authLoading, login } = useAuth();
  const navigate = useNavigate();
  const formRef = useRef(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [focusedField, setFocusedField] = useState(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      void navigate({ to: "/dashboard" });
    }
  }, [isAuthenticated, authLoading, navigate]);

  const validate = () => {
    const e = {};
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
      e.email = "Enter a valid email address";
    if (password.length < 8)
      e.password = "Password must be at least 8 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      await login({ email, password });
      toast.success("Welcome back 👋");

      void navigate({ to: "/dashboard" });
    } catch {
      toast.error("Sign in failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = (field, hasError) =>
    `
    pl-10 h-12 rounded-xl border transition-all duration-200
    bg-background shadow-sm
    text-foreground placeholder:text-muted-foreground/50
    ${hasError
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
        {/* Animated orbs */}
        <AnimatedOrb
          className="-top-32 -left-24 w-[500px] h-[500px]"
          color="oklch(var(--auth-orb-1))"
          delay={0}
        />
        <AnimatedOrb
          className="bottom-10 right-0 w-96 h-96"
          color="oklch(var(--auth-orb-2))"
          delay={2}
        />
        <AnimatedOrb
          className="top-1/2 left-1/3 w-64 h-64"
          color="oklch(var(--auth-orb-1) / 0.4)"
          delay={4}
        />

        {/* Fine grid overlay */}
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
          className="flex items-center -gap-12 relative z-10"
        >
          <LogoMark size={80} />
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
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-sm">
              <span
                className="w-1.5 h-1.5 rounded-full bg-primary"
              />
              <span className="text-xs font-medium text-primary/90">
                Trusted by 50,000+ teams worldwide
              </span>
            </div>
            <h1 className="text-5xl xl:text-6xl font-display font-bold leading-[1.1] text-foreground">
              Ship projects{" "}
              <span className="gradient-text-hero">faster than ever</span>
            </h1>
            <p className="text-base text-muted-foreground leading-relaxed max-w-sm">
              The all-in-one project management platform built for modern teams.
            </p>
          </div>

          <div className="space-y-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.45, delay: 0.28 + i * 0.1 }}
                className="glass-card-hover p-4 flex items-start gap-4 group"
              >
                <div
                  className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    background: `${f.color} / 0.12`,
                    border: `1px solid ${f.color} / 0.2`,
                  }}
                >
                  <f.icon className="w-4.5 h-4.5" style={{ color: f.color }} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground/90">{f.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Testimonial */}
        <motion.blockquote
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.65 }}
          className="relative z-10 glass-card p-5 space-y-3"
        >
          <div className="flex gap-1 mb-1">
            {["s1", "s2", "s3", "s4", "s5"].map((k) => (
              <span key={k} className="text-amber-500 text-xs">
                ★
              </span>
            ))}
          </div>
          <p className="text-sm text-foreground/80 italic leading-relaxed">
            "{APP_NAME} cut our sprint planning time in half and made our remote
            team feel like they're in the same room."
          </p>
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 shadow-glow"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.72 0.19 268), oklch(0.68 0.16 189))",
              }}
            >
              SJ
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">Sarah Johnson</p>
              <p className="text-xs text-muted-foreground">VP Engineering, Vercel</p>
            </div>
          </div>
        </motion.blockquote>
      </div>

      {/* ── Right panel ────────────────────────────────────────────────────── */}
      <div
        className="flex-1 flex items-center justify-center p-6 sm:p-10 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(160deg, oklch(var(--auth-bg-right)) 0%, oklch(var(--background)) 100%)",
        }}
      >
        {/* Subtle bg orb for right panel */}
        <div
          className="absolute bottom-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-10 pointer-events-none"
          style={{ background: "oklch(0.72 0.19 268)" }}
        />
        <div
          className="absolute top-0 left-0 w-64 h-64 rounded-full blur-3xl opacity-8 pointer-events-none"
          style={{ background: "oklch(0.68 0.16 189)" }}
        />

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08 }}
          className="w-full max-w-md relative z-10"
        >
          {/* Card container */}
          <div
            className="rounded-2xl border border-border/50 p-8 backdrop-blur-xl space-y-7 glass-card"
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
                Welcome back
              </h2>
              <p className="text-sm text-muted-foreground">
                Sign in to continue to your workspace
              </p>
            </motion.div>

            <form
              ref={formRef}
              onSubmit={(e) => void handleSubmit(e)}
              className="space-y-5"
              data-ocid="login-form"
              noValidate
            >
              {/* Email */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="space-y-1.5"
              >
                <Label
                  htmlFor="email"
                  className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                >
                  Email address
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
                    id="email"
                    data-ocid="login-email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => {
                      setFocusedField(null);
                      validate();
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
              </motion.div>

              {/* Password */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.27 }}
                className="space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="password"
                    className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                  >
                    Password
                  </Label>
                  <Link
                    to="/forgot-password"
                    data-ocid="forgot-password-link"
                    className="text-xs text-primary/80 hover:text-primary transition-colors duration-150 hover:underline underline-offset-2"
                  >
                    Forgot password?
                  </Link>
                </div>
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
                    id="password"
                    data-ocid="login-password"
                    type={showPass ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => {
                      setFocusedField(null);
                      validate();
                    }}
                    className={`${inputClass("password", !!errors.password)} pr-11`}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-150"
                    aria-label={showPass ? "Hide password" : "Show password"}
                  >
                    {showPass ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
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
              </motion.div>

              {/* Remember me */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.33 }}
                className="flex items-center gap-2.5"
              >
                <Checkbox
                  id="remember"
                  data-ocid="checkbox-remember"
                  checked={remember}
                  onCheckedChange={(v) => setRemember(!!v)}
                  className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <Label
                  htmlFor="remember"
                  className="text-sm text-muted-foreground cursor-pointer"
                >
                  Remember me for 30 days
                </Label>
              </motion.div>

              {/* Submit */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.38 }}
              >
                <Button
                  type="submit"
                  data-ocid="login-submit"
                  disabled={isSubmitting}
                  className="w-full h-12 rounded-xl font-semibold text-white border-0 transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5 hover:shadow-glow active:translate-y-0 group"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.72 0.19 268), oklch(0.65 0.18 230), oklch(0.68 0.16 189))",
                    boxShadow: "0 4px 24px oklch(0.72 0.19 268 / 0.3)",
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
                      Signing in…
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Sign in
                      <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </span>
                  )}
                </Button>
              </motion.div>
            </form>


            {/* Sign up link */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.5 }}
              className="text-center text-sm text-muted-foreground"
            >
              No account yet?{" "}
              <Link
                to="/register"
                data-ocid="register-link"
                className="text-primary font-semibold hover:text-primary/80 transition-colors duration-150 hover:underline underline-offset-2"
              >
                Sign up free
              </Link>
            </motion.p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
