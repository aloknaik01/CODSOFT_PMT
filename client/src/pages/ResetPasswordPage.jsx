import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate, useSearch } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  ShieldCheck,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { apiResetPassword } from "../services/api";
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

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false });
  const token = search.token ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [focusedField, setFocusedField] = useState(null);

  // Redirect after success
  useEffect(() => {
    if (!isSuccess) return;
    const t = setTimeout(() => void navigate({ to: "/login" }), 2500);
    return () => clearTimeout(t);
  }, [isSuccess, navigate]);

  const validate = () => {
    const e = {};
    if (password.length < 8)
      e.password = "Password must be at least 8 characters";
    if (password !== confirmPassword) e.confirm = "Passwords don't match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    if (!token) {
      setErrors({ general: "Invalid or missing token" });
      return;
    }
    setIsSubmitting(true);
    try {
      await apiResetPassword(token, password);
      setIsSuccess(true);
      toast.success("Password updated!");
    } catch {
      setErrors({ general: "Something went wrong" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = (field, hasError) =>
    `
    pl-10 h-12 rounded-xl border transition-all duration-200
    bg-white/5 dark:bg-white/[0.03] backdrop-blur-sm
    text-foreground placeholder:text-muted-foreground/50
    ${
      hasError
        ? "border-destructive/70 shadow-[0_0_0_3px_oklch(0.62_0.2_27/0.15)]"
        : focusedField === field
          ? "border-primary/60 shadow-[0_0_0_3px_oklch(0.72_0.19_268/0.18)] bg-white/[0.07]"
          : "border-white/10 hover:border-white/20"
    }
  `.trim();

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(160deg, oklch(0.1 0.02 268) 0%, oklch(0.08 0.01 268) 100%)",
      }}
    >
      <AnimatedOrb
        className="-top-32 -left-24 w-[500px] h-[500px]"
        color="oklch(0.72 0.19 268 / 0.25)"
        delay={0}
      />
      <AnimatedOrb
        className="bottom-10 right-0 w-96 h-96"
        color="oklch(0.68 0.16 189 / 0.2)"
        delay={2}
      />
      <AnimatedOrb
        className="top-1/2 left-1/3 w-64 h-64"
        color="oklch(0.72 0.19 268 / 0.1)"
        delay={4}
      />

      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle, white 1px, transparent 1px)",
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
          <span className="text-2xl font-display font-bold text-white tracking-tight">
            {APP_NAME}
          </span>
        </motion.div>

        {/* Card */}
        <div
          className="rounded-2xl border border-white/10 p-8 backdrop-blur-xl space-y-7"
          style={{
            background: "oklch(0.12 0.01 268 / 0.8)",
            boxShadow:
              "0 0 0 1px oklch(0.72 0.19 268 / 0.08), 0 32px 64px -12px oklch(0 0 0 / 0.5), 0 0 60px -10px oklch(0.72 0.19 268 / 0.08)",
          }}
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
                data-ocid="reset-password-success"
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
                  className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.72 0.15 142 / 0.2), oklch(0.68 0.16 189 / 0.2))",
                    border: "1px solid oklch(0.72 0.15 142 / 0.3)",
                  }}
                >
                  <ShieldCheck
                    className="w-8 h-8"
                    style={{ color: "oklch(0.72 0.15 142)" }}
                  />
                </motion.div>

                <div className="space-y-2">
                  <h2 className="text-2xl font-display font-bold text-white">
                    Password updated
                  </h2>
                  <p className="text-sm text-white/50 leading-relaxed">
                    Your password has been reset successfully. Redirecting you
                    to sign in…
                  </p>
                </div>

                <div className="flex items-center justify-center gap-2 text-xs text-white/30">
                  <svg
                    className="animate-spin w-3.5 h-3.5"
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
                  Redirecting in 2 seconds…
                </div>
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
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{
                      background: "oklch(0.72 0.19 268 / 0.15)",
                      border: "1px solid oklch(0.72 0.19 268 / 0.25)",
                    }}
                  >
                    <Lock
                      className="w-5 h-5"
                      style={{ color: "oklch(0.72 0.19 268)" }}
                    />
                  </div>
                  <h2 className="text-2xl font-display font-bold text-white">
                    Set new password
                  </h2>
                  <p className="text-sm text-white/45 leading-relaxed">
                    Choose a strong password for your {APP_NAME} account.
                  </p>
                </motion.div>

                {/* General error */}
                <AnimatePresence>
                  {errors.general && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="rounded-xl px-4 py-3 border flex items-start gap-2.5"
                      style={{
                        background: "oklch(0.62 0.2 27 / 0.12)",
                        borderColor: "oklch(0.62 0.2 27 / 0.3)",
                      }}
                      data-ocid="reset-password-error"
                    >
                      <AlertCircle
                        className="w-4 h-4 flex-shrink-0 mt-0.5"
                        style={{ color: "oklch(0.62 0.2 27)" }}
                      />
                      <p className="text-xs text-destructive leading-relaxed">
                        {errors.general}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form
                  onSubmit={(e) => void handleSubmit(e)}
                  className="space-y-5"
                  noValidate
                  data-ocid="reset-password-form"
                >
                  {/* New password */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="space-y-1.5"
                  >
                    <Label
                      htmlFor="password"
                      className="text-xs font-semibold text-white/60 uppercase tracking-wider"
                    >
                      New password
                    </Label>
                    <div className="relative">
                      <Lock
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-colors duration-200"
                        style={{
                          color:
                            focusedField === "password"
                              ? "oklch(0.72 0.19 268)"
                              : "oklch(0.6 0 0)",
                        }}
                      />
                      <Input
                        id="password"
                        data-ocid="reset-new-password"
                        type={showPass ? "text" : "password"}
                        placeholder="At least 8 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setFocusedField("password")}
                        onBlur={() => {
                          setFocusedField(null);
                          validate();
                        }}
                        className={`${inputClass("password", !!errors.password)} pr-11`}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass((v) => !v)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors duration-150"
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

                  {/* Confirm password */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.27 }}
                    className="space-y-1.5"
                  >
                    <Label
                      htmlFor="confirm-password"
                      className="text-xs font-semibold text-white/60 uppercase tracking-wider"
                    >
                      Confirm new password
                    </Label>
                    <div className="relative">
                      <Lock
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-colors duration-200"
                        style={{
                          color:
                            focusedField === "confirm"
                              ? "oklch(0.72 0.19 268)"
                              : "oklch(0.6 0 0)",
                        }}
                      />
                      <Input
                        id="confirm-password"
                        data-ocid="reset-confirm-password"
                        type={showConfirm ? "text" : "password"}
                        placeholder="Repeat your new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        onFocus={() => setFocusedField("confirm")}
                        onBlur={() => {
                          setFocusedField(null);
                          validate();
                        }}
                        className={`${inputClass("confirm", !!errors.confirm)} pr-11`}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm((v) => !v)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors duration-150"
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
                      {errors.confirm && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          className="text-xs text-destructive flex items-center gap-1"
                        >
                          <span className="inline-block w-1 h-1 rounded-full bg-destructive" />
                          {errors.confirm}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* Password strength hint */}
                  {password.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="space-y-1.5"
                    >
                      <div className="flex gap-1">
                        {["s1", "s2", "s3", "s4"].map((segKey, i) => {
                          const strength = Math.min(
                            4,
                            (password.length >= 8 ? 1 : 0) +
                              (/[A-Z]/.test(password) ? 1 : 0) +
                              (/[0-9]/.test(password) ? 1 : 0) +
                              (/[^A-Za-z0-9]/.test(password) ? 1 : 0),
                          );
                          const filled = i < strength;
                          const colors = [
                            "oklch(0.62 0.2 27)",
                            "oklch(0.62 0.2 27)",
                            "oklch(0.68 0.18 80)",
                            "oklch(0.72 0.15 142)",
                          ];
                          return (
                            <div
                              key={segKey}
                              className="h-1 flex-1 rounded-full transition-all duration-300"
                              style={{
                                background: filled
                                  ? colors[strength - 1]
                                  : "oklch(0.22 0 0)",
                              }}
                            />
                          );
                        })}
                      </div>
                      <p className="text-xs text-white/30">
                        {password.length < 8
                          ? "Too short"
                          : /[A-Z]/.test(password) &&
                              /[0-9]/.test(password) &&
                              /[^A-Za-z0-9]/.test(password)
                            ? "Strong password ✓"
                            : /[A-Z]/.test(password) || /[0-9]/.test(password)
                              ? "Medium strength"
                              : "Weak — add numbers or symbols"}
                      </p>
                    </motion.div>
                  )}

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.33 }}
                  >
                    <Button
                      type="submit"
                      data-ocid="reset-password-submit"
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
                          Updating password…
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          Update password
                          <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                        </span>
                      )}
                    </Button>
                  </motion.div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
