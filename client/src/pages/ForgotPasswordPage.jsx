import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, CheckCircle2, Mail, Send } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { apiForgotPassword } from "../services/api";
import { APP_NAME } from "../constants";

function AnimatedOrb({ className, color, delay = 0 }) {
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl pointer-events-none ${className}`}
      style={{ background: color }}
      animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.25, 0.15] }}
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
    <div
      className="flex-shrink-0"
      style={{ width: size, height: 'auto' }}
    >
      <img 
        src="/LumoPng.png" 
        alt="Lumo Logo" 
        style={{ width: size, height: 'auto' }}
        className="object-contain"
      />
    </div>
  );
}

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState(false);

  const validateEmail = (val) => {
    if (!val.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setEmailError("Enter a valid email address");
      return false;
    }
    setEmailError("");
    return true;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validateEmail(email)) return;
    setIsSubmitting(true);
    try {
      await apiForgotPassword(email);
      setIsSuccess(true);
    } catch {
      setEmailError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = `
    pl-10 h-12 rounded-xl border transition-all duration-200
    bg-background shadow-sm
    text-foreground placeholder:text-muted-foreground/50
    ${
      emailError
        ? "border-destructive/70 shadow-[0_0_0_3px_oklch(var(--destructive)/0.15)]"
        : focusedField
          ? "border-primary/60 shadow-[0_0_0_3px_oklch(var(--primary)/0.18)] bg-primary/[0.03]"
          : "border-border hover:border-border/80"
    }
  `.trim();

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-background"
      style={{
        background:
          "linear-gradient(160deg, oklch(var(--auth-bg-right)) 0%, oklch(var(--background)) 100%)",
      }}
    >
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

      <div
        className="absolute inset-0 pointer-events-none opacity-[0.05] dark:opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle, currentColor 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.08 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3 justify-center mb-8"
        >
          <LogoMark size={40} />
          <span className="text-2xl font-display font-bold text-foreground tracking-tight">
            {APP_NAME}
          </span>
        </motion.div>

        {/* Card */}
        <div
          className="rounded-2xl border border-border/50 p-8 backdrop-blur-xl space-y-7 glass-card"
        >
          <AnimatePresence mode="wait">
            {isSuccess ? (
              /* ── Success state ─────────────────────────────────────── */
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
                className="text-center space-y-5 py-4"
                data-ocid="forgot-password-success"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                    delay: 0.1,
                  }}
                  className="w-20 h-20 rounded-full flex items-center justify-center mx-auto bg-primary/10 border border-primary/20"
                >
                  <Send
                    className="w-8 h-8 text-primary"
                  />
                </motion.div>

                <div className="space-y-2">
                  <h2 className="text-2xl font-display font-bold text-foreground">
                    Check your email
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    We sent a password reset link to{" "}
                    <span className="text-primary font-medium">{email}</span>.
                    Check your inbox and follow the instructions.
                  </p>
                </div>

                <div
                  className="rounded-xl px-4 py-3 border border-primary/10 text-xs text-muted-foreground text-left bg-muted/30"
                >
                  <strong className="text-foreground/80">Didn't receive it?</strong>{" "}
                  Check your spam folder or{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSuccess(false);
                      setEmail("");
                    }}
                    className="text-primary hover:underline underline-offset-2"
                  >
                    try a different email
                  </button>
                  .
                </div>

                <Button
                  type="button"
                  onClick={() => void navigate({ to: "/login" })}
                  data-ocid="back-to-login-btn"
                  className="w-full h-12 rounded-xl font-semibold text-white border-0 transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.72 0.19 268), oklch(0.65 0.18 230), oklch(0.68 0.16 189))",
                    boxShadow: "0 4px 24px oklch(0.72 0.19 268 / 0.3)",
                  }}
                >
                  <span className="flex items-center justify-center gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Back to sign in
                  </span>
                </Button>
              </motion.div>
            ) : (
              /* ── Form state ────────────────────────────────────────── */
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-7"
              >
                {/* Heading */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.15 }}
                  className="space-y-2"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-primary/10 border border-primary/25"
                  >
                    <Mail
                      className="w-5 h-5 text-primary"
                    />
                  </div>
                  <h2 className="text-2xl font-display font-bold text-foreground">
                    Forgot your password?
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    No worries — enter your email and we'll send you a reset
                    link.
                  </p>
                </motion.div>

                <form
                  onSubmit={(e) => void handleSubmit(e)}
                  className="space-y-5"
                  noValidate
                  data-ocid="forgot-password-form"
                >
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
                          color: focusedField
                            ? "oklch(var(--primary))"
                            : "oklch(var(--muted-foreground))",
                        }}
                      />
                      <Input
                        id="email"
                        data-ocid="forgot-password-email"
                        type="email"
                        placeholder="you@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onFocus={() => setFocusedField(true)}
                        onBlur={() => {
                          setFocusedField(false);
                          if (email) validateEmail(email);
                        }}
                        className={inputClass}
                        autoComplete="email"
                      />
                    </div>
                    <AnimatePresence>
                      {emailError && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          className="text-xs text-destructive flex items-center gap-1"
                        >
                          <span className="inline-block w-1 h-1 rounded-full bg-destructive" />
                          {emailError}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.27 }}
                  >
                    <Button
                      type="submit"
                      data-ocid="forgot-password-submit"
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
                          Sending reset link…
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          Send reset link
                          <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                        </span>
                      )}
                    </Button>
                  </motion.div>
                </form>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.38 }}
                  className="text-center text-sm text-muted-foreground"
                >
                  <Link
                    to="/login"
                    data-ocid="back-to-login-link"
                    className="inline-flex items-center gap-1.5 text-primary/80 hover:text-primary transition-colors duration-150 hover:underline underline-offset-2"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back to sign in
                  </Link>
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
