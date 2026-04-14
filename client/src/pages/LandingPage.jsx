import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BarChart3,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  Globe,
  Layers,
  LayoutDashboard,
  Menu,
  MessageSquare,
  Moon,
  Play,
  Shield,
  Star,
  Sun,
  TrendingUp,
  Users,
  X,
  Zap,
} from "lucide-react";
import {
  AnimatePresence,
  motion,
  useInView,
  useScroll,
  useTransform,
} from "motion/react";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { APP_NAME } from "../constants";

// ── Helpers ──────────────────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

const staggerSlow = {
  visible: { transition: { staggerChildren: 0.2 } },
};

// ── Particle dots background ──────────────────────────────────────────────────

function ParticleMesh() {
  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      {/* Deep radial glow — primary (purple) */}
      <div
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-[1100px] h-[800px] rounded-full opacity-50 blur-[120px]"
        style={{
          background:
            "radial-gradient(circle at 50% 40%, oklch(0.72 0.19 268 / 0.28) 0%, oklch(0.72 0.2 189 / 0.1) 55%, transparent 80%)",
        }}
      />
      {/* Secondary accent glow — cyan, bottom right */}
      <div
        className="absolute bottom-20 -right-24 w-[600px] h-[600px] rounded-full opacity-40 blur-[100px]"
        style={{
          background:
            "radial-gradient(circle, oklch(0.72 0.2 189 / 0.22) 0%, transparent 70%)",
        }}
      />
      {/* Left accent */}
      <div
        className="absolute top-1/3 -left-32 w-[400px] h-[400px] rounded-full opacity-30 blur-[80px]"
        style={{
          background:
            "radial-gradient(circle, oklch(0.72 0.19 268 / 0.18) 0%, transparent 70%)",
        }}
      />
      {/* Fine dot grid */}
      <div
        className="absolute inset-0 opacity-[0.035] dark:opacity-[0.055]"
        style={{
          backgroundImage:
            "radial-gradient(circle, oklch(var(--foreground)) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }}
      />
      {/* Faint diagonal lines */}
      <div
        className="absolute inset-0 opacity-[0.015] dark:opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(oklch(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, oklch(var(--foreground)) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />
      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}

// ── Navbar ───────────────────────────────────────────────────────────────────

function Navbar() {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setOpen(false);
  };

  const links = ["features", "how-it-works", "pricing", "testimonials", "faq"];
  const labels = {
    features: "Features",
    "how-it-works": "How It Works",
    pricing: "Pricing",
    testimonials: "Testimonials",
    faq: "FAQ",
  };

  return (
    <header
      data-ocid="navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-400 ${scrolled
        ? "bg-card/75 backdrop-blur-2xl border-b border-white/10 dark:border-white/[0.06] shadow-subtle"
        : "bg-transparent"
        }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-[68px] flex items-center justify-between">
        {/* Logo */}
        <a
          href="/"
          className="flex items-center gap-2.5 font-display font-bold text-xl group"
        >
          <div className="flex items-center justify-center -gap-5">
            <motion.div
              className="flex items-center justify-center transition-spring"
              whileHover={{ scale: 1.08 }}
            >
              <img
                src="/LumoPng.png"
                alt="Lumo Logo"
                className="h-12 w-auto object-contain"
              />
            </motion.div>
            <span className="tracking-tight text-2xl">{APP_NAME}</span>
          </div>
        </a>

        {/* Desktop links */}
        <nav className="hidden md:flex items-center gap-1">
          {links.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => scrollTo(id)}
              className="px-3.5 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/30 rounded-lg transition-smooth"
            >
              {labels[id]}
            </button>
          ))}
        </nav>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-2.5">
          <button
            type="button"
            data-ocid="theme-toggle"
            onClick={() =>
              setTheme(resolvedTheme === "dark" ? "light" : "dark")
            }
            className="w-9 h-9 rounded-lg border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-border hover:bg-muted/30 transition-smooth"
            aria-label="Toggle theme"
          >
            {resolvedTheme === "dark" ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>
          {isAuthenticated ? (
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button
                size="sm"
                asChild
                data-ocid="dashboard-btn-nav"
                className="btn-primary bg-gradient-to-r from-primary to-accent text-white border-0 hover:opacity-95 shadow-lg shadow-primary/25 px-4 rounded-lg font-semibold"
              >
                <a href="/dashboard">Go to Dashboard</a>
              </Button>
            </motion.div>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                asChild
                data-ocid="signin-btn"
                className="font-medium"
              >
                <a href="/login">Sign In</a>
              </Button>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button
                  size="sm"
                  asChild
                  data-ocid="get-started-btn"
                  className="btn-primary bg-gradient-to-r from-primary to-accent text-white border-0 hover:opacity-95 shadow-lg shadow-primary/25 px-4 rounded-lg font-semibold"
                >
                  <a href="/register">Get Started Free</a>
                </Button>
              </motion.div>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <motion.button
          type="button"
          className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-smooth rounded-lg hover:bg-muted/30"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          whileTap={{ scale: 0.92 }}
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </motion.button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden border-t border-white/10 bg-card/90 backdrop-blur-2xl overflow-hidden"
          >
            <div className="px-6 py-5 flex flex-col gap-1">
              {links.map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => scrollTo(id)}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground text-left px-3 py-2.5 rounded-lg hover:bg-muted/30 transition-smooth"
                >
                  {labels[id]}
                </button>
              ))}
              <div className="flex items-center gap-3 pt-3 mt-2 border-t border-border/40">
                {isAuthenticated ? (
                  <Button
                    size="sm"
                    asChild
                    className="flex-1 bg-gradient-to-r from-primary to-accent text-white border-0 shadow-lg shadow-primary/20"
                  >
                    <a href="/dashboard">Go to Dashboard</a>
                  </Button>
                ) : (
                  <>
                    <Button variant="ghost" size="sm" asChild className="flex-1">
                      <a href="/login">Sign In</a>
                    </Button>
                    <Button
                      size="sm"
                      asChild
                      className="flex-1 bg-gradient-to-r from-primary to-accent text-white border-0 shadow-lg shadow-primary/20"
                    >
                      <a href="/register">Get Started</a>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

// ── Floating stat pill ────────────────────────────────────────────────────────

function FloatingPill({ icon: Icon, label, value, color, className, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`glass-card-elevated px-3.5 py-2.5 flex items-center gap-2.5 text-sm font-medium shadow-premium ${className ?? ""}`}
    >
      <div
        className={`w-7 h-7 rounded-lg ${color} flex items-center justify-center shrink-0`}
      >
        <Icon className="w-3.5 h-3.5 text-white" />
      </div>
      <div className="min-w-0">
        <div className="text-foreground font-semibold leading-tight truncate">
          {value}
        </div>
        <div className="text-muted-foreground text-xs leading-tight truncate">
          {label}
        </div>
      </div>
    </motion.div>
  );
}

// ── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
  const { isAuthenticated } = useAuth();
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 600], [0, 80]);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20 pb-12">
      <ParticleMesh />

      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center w-full">
        <motion.div initial="hidden" animate="visible" variants={stagger}>
          {/* Pill badge */}
          <motion.div
            variants={fadeUp}
            className="flex items-center justify-center gap-2 mb-8"
          >
            <motion.div
              animate={{
                boxShadow: [
                  "0 0 0px oklch(0.72 0.19 268 / 0)",
                  "0 0 20px oklch(0.72 0.19 268 / 0.35)",
                  "0 0 0px oklch(0.72 0.19 268 / 0)",
                ],
              }}
              transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2.5 }}
              className="rounded-full"
            >

            </motion.div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeUp}
            className="text-5xl sm:text-6xl md:text-[4.75rem] lg:text-[5.5rem] font-display font-black leading-[1.05] tracking-tight mb-7"
          >
            <span className="text-foreground">Manage Projects</span>
            <br />
            <span className="text-foreground">Like a Pro,</span>{" "}
            <span className="gradient-text-hero">Ship Faster</span>
            <br className="hidden sm:block" />
            <span className="text-foreground"> Than Ever</span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            variants={fadeUp}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-11 leading-relaxed"
          >
            The all-in-one workspace where high-performing teams plan, track,
            and collaborate — from first idea to final deployment, without the
            chaos.
          </motion.p>

          {/* CTA row */}
          <motion.div
            variants={fadeUp}
            className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-20"
          >
            {isAuthenticated ? (
              <motion.div
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
              >
                <Button
                  size="lg"
                  asChild
                  data-ocid="hero-cta-dashboard"
                  className="px-9 h-14 text-base bg-gradient-to-r from-primary to-accent text-white border-0 hover:opacity-95 shadow-xl shadow-primary/35 rounded-xl font-bold tracking-tight"
                >
                  <a href="/dashboard">
                    Go to Your Dashboard
                    <ArrowRight className="ml-2 w-4.5 h-4.5 w-[18px] h-[18px]" />
                  </a>
                </Button>
              </motion.div>
            ) : (
              <motion.div
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
              >
                <Button
                  size="lg"
                  asChild
                  data-ocid="hero-cta-primary"
                  className="px-9 h-14 text-base bg-gradient-to-r from-primary to-accent text-white border-0 hover:opacity-95 shadow-xl shadow-primary/35 rounded-xl font-bold tracking-tight"
                >
                  <a href="/register">
                    Start Free Today{" "}
                    <ArrowRight className="ml-2 w-4.5 h-4.5 w-[18px] h-[18px]" />
                  </a>
                </Button>
              </motion.div>
            )}
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button
                size="lg"
                variant="outline"
                type="button"
                data-ocid="hero-cta-demo"
                onClick={() =>
                  document
                    .getElementById("features")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="px-8 h-14 text-base border border-white/20 dark:border-white/15 hover:border-primary/40 hover:bg-primary/5 rounded-xl font-semibold group backdrop-blur-sm"
              >
                <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center mr-2.5 group-hover:bg-primary/25 transition-smooth">
                  <Play className="w-3.5 h-3.5 text-primary fill-primary/60 ml-0.5" />
                </div>
                Watch Demo
              </Button>
            </motion.div>
          </motion.div>

          {/* Dashboard preview */}
          <motion.div variants={fadeUp} className="relative mx-auto max-w-5xl">
            {/* Outer ambient glow */}
            <div
              className="absolute -inset-6 rounded-3xl blur-2xl opacity-40"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.72 0.19 268 / 0.25), oklch(0.72 0.2 189 / 0.15), oklch(0.72 0.19 268 / 0.2))",
              }}
            />
            {/* Card frame */}
            <motion.div
              style={{ y }}
              className="relative glass-card-elevated overflow-hidden p-1.5 rounded-2xl border border-white/[0.12] shadow-premium"
            >
              <img
                src="/assets/generated/hero-dashboard.dim_1200x720.jpg"
                alt={`${APP_NAME} Dashboard Preview`}
                className="rounded-xl w-full object-cover"
                width={1200}
                height={720}
              />
              {/* Top overlay gradient on image */}
              <div className="absolute inset-x-1.5 top-1.5 h-16 bg-gradient-to-b from-background/30 to-transparent rounded-t-xl pointer-events-none" />
            </motion.div>

            {/* Floating pills */}
            <FloatingPill
              icon={Check}
              value="12 tasks done"
              label="today"
              color="bg-emerald-500"
              className="absolute -top-4 -left-6 md:left-4 z-10"
              delay={1}
            />
            <FloatingPill
              icon={TrendingUp}
              value="+34% velocity"
              label="this sprint"
              color="bg-gradient-to-br from-primary to-accent"
              className="absolute -top-4 -right-6 md:right-4 z-10"
              delay={1.15}
            />
            <FloatingPill
              icon={Users}
              value="24 members"
              label="online now"
              color="bg-accent"
              className="absolute -bottom-5 left-1/2 -translate-x-1/2 z-10"
              delay={1.3}
            />
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground/60"
      >
        <span className="text-[10px] font-semibold tracking-[0.18em] uppercase">
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{
            repeat: Number.POSITIVE_INFINITY,
            duration: 1.6,
            ease: "easeInOut",
          }}
        >
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </motion.div>
    </section>
  );
}

// ── Social Proof ─────────────────────────────────────────────────────────────

const companies = [
  "Acme Corp",
  "Nexus AI",
  "Orbital Labs",
  "Vertex Systems",
  "Cipher Works",
  "Quantum IO",
  "Nova Studio",
  "Apex Digital",
  "Flux Industries",
  "Prism Tech",
];

function SocialProof() {
  return (
    <section className="py-14 border-y border-white/[0.06] dark:border-white/[0.04] bg-gradient-to-r from-transparent via-muted/20 to-transparent overflow-hidden">
      <p className="text-center text-xs font-bold text-muted-foreground/60 mb-7 uppercase tracking-[0.2em]">
        Trusted by world-class teams at
      </p>
      <div className="relative flex overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
        {[0, 1].map((i) => (
          <motion.div
            key={i}
            className="flex shrink-0 gap-10 px-5"
            animate={{ x: [0, "-50%"] }}
            transition={{
              duration: 22,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          >
            {[...companies, ...companies].map((name, idx) => (
              <div
                key={`strip-${i}-${idx}-${name}`}
                className="shrink-0 flex items-center gap-2.5 text-muted-foreground/50 hover:text-muted-foreground/80 transition-smooth whitespace-nowrap font-display font-semibold text-base tracking-tight"
              >
                <div className="w-5 h-5 rounded-md bg-gradient-to-br from-primary/50 to-accent/50 shrink-0" />
                {name}
              </div>
            ))}
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ── Features ─────────────────────────────────────────────────────────────────

const features = [
  {
    icon: LayoutDashboard,
    title: "Kanban Boards",
    description:
      "Visualize every task with drag-and-drop boards. Move cards across stages in real-time with zero friction.",
    gradient: "from-primary/30 via-primary/15 to-transparent",
    glowColor: "shadow-primary/20",
    iconBg:
      "bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20",
    iconColor: "text-primary",
  },
  {
    icon: Shield,
    title: "Role-Based Access",
    description:
      "Granular permissions for Owners, Admins, and Members. Enterprise-grade security without the complexity.",
    gradient: "from-accent/30 via-accent/15 to-transparent",
    glowColor: "shadow-accent/20",
    iconBg:
      "bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/20",
    iconColor: "text-accent",
  },
  {
    icon: BarChart3,
    title: "Progress Tracking",
    description:
      "Visual progress bars, burndown charts, and velocity metrics. Know exactly where every project stands.",
    gradient: "from-emerald-500/25 via-emerald-500/10 to-transparent",
    glowColor: "shadow-emerald-500/15",
    iconBg:
      "bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/20",
    iconColor: "text-emerald-400",
  },
  {
    icon: MessageSquare,
    title: "Team Collaboration",
    description:
      "Threaded comments, @mentions, file attachments, and activity feeds. Your team's second brain.",
    gradient: "from-amber-500/25 via-amber-500/10 to-transparent",
    glowColor: "shadow-amber-500/15",
    iconBg:
      "bg-gradient-to-br from-amber-500/20 to-amber-500/5 border border-amber-500/20",
    iconColor: "text-amber-400",
  },
  {
    icon: Users,
    title: "Secure Authentication",
    description:
      "Internet Identity-powered login. Passwordless, phishing-resistant, and enterprise-grade from day one.",
    gradient: "from-rose-500/25 via-rose-500/10 to-transparent",
    glowColor: "shadow-rose-500/15",
    iconBg:
      "bg-gradient-to-br from-rose-500/20 to-rose-500/5 border border-rose-500/20",
    iconColor: "text-rose-400",
  },
  {
    icon: Clock,
    title: "Smart Deadlines",
    description:
      "Intelligent due-date warnings, priority escalation, and automated reminders so you never miss a beat.",
    gradient: "from-violet-500/25 via-violet-500/10 to-transparent",
    glowColor: "shadow-violet-500/15",
    iconBg:
      "bg-gradient-to-br from-violet-500/20 to-violet-500/5 border border-violet-500/20",
    iconColor: "text-violet-400",
  },
];

function FeatureCard({ feat, index }) {
  const Icon = feat.icon;
  return (
    <motion.div
      variants={fadeUp}
      custom={index}
      data-ocid={`feature-${feat.title.toLowerCase().replace(/\s/g, "-")}`}
      className="group glass-card-hover p-7 cursor-default relative overflow-hidden"
    >
      {/* Background gradient on hover */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${feat.gradient} opacity-0 group-hover:opacity-100 transition-smooth rounded-xl pointer-events-none`}
      />

      {/* Icon */}
      <div
        className={`relative w-12 h-12 rounded-xl ${feat.iconBg} flex items-center justify-center mb-5 group-hover:scale-110 group-hover:shadow-lg ${feat.glowColor} transition-spring`}
      >
        <Icon className={`w-5 h-5 ${feat.iconColor}`} />
      </div>

      <h3 className="relative font-display font-bold text-lg mb-2.5 text-foreground group-hover:text-foreground transition-smooth">
        {feat.title}
      </h3>
      <p className="relative text-muted-foreground text-sm leading-relaxed">
        {feat.description}
      </p>

      {/* Bottom border glow on hover */}
      <div
        className={`absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r from-transparent ${feat.iconColor.replace("text-", "via-")}/40 to-transparent opacity-0 group-hover:opacity-100 transition-smooth`}
      />
    </motion.div>
  );
}

function Features() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      id="features"
      ref={ref}
      className="py-32 bg-background relative overflow-hidden"
    >
      {/* Subtle section glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/[0.04] blur-3xl rounded-full pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6">
        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={stagger}
          className="text-center mb-16"
        >
          <motion.div variants={fadeUp}>
            <Badge className="mb-5 px-4 py-1.5 bg-primary/10 text-primary border border-primary/25 rounded-full text-sm font-semibold">
              Features
            </Badge>
          </motion.div>
          <motion.h2
            variants={fadeUp}
            className="text-4xl md:text-5xl font-display font-black mb-4 tracking-tight"
          >
            Everything your team needs to{" "}
            <span className="gradient-text-hero">move fast</span>
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Six powerhouse capabilities bundled into one beautiful workspace.
            Stop juggling tools.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={staggerSlow}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {features.map((feat, i) => (
            <FeatureCard key={feat.title} feat={feat} index={i} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ── How It Works ─────────────────────────────────────────────────────────────

const steps = [
  {
    num: "01",
    title: "Create Your Project",
    desc: "Set up a project in seconds. Define goals, milestones, and deadlines. Customize your kanban columns to fit your workflow perfectly.",
    icon: ChevronRight,
  },
  {
    num: "02",
    title: "Invite Your Team",
    desc: "Add teammates with a single link. Assign roles, set permissions, and onboard new members to any project without missing a beat.",
    icon: Users,
  },
  {
    num: "03",
    title: "Track & Ship",
    desc: "Monitor progress with real-time dashboards, celebrate completions, and keep stakeholders in the loop automatically.",
    icon: TrendingUp,
  },
];

function HowItWorks() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      id="how-it-works"
      ref={ref}
      className="py-32 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, oklch(var(--card)) 0%, oklch(var(--muted) / 0.15) 50%, oklch(var(--card)) 100%)",
      }}
    >
      {/* Background accent */}
      <div
        className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, oklch(var(--foreground)) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6">
        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={stagger}
          className="text-center mb-20"
        >
          <motion.div variants={fadeUp}>
            <Badge className="mb-5 px-4 py-1.5 bg-accent/10 text-accent border border-accent/25 rounded-full text-sm font-semibold">
              How It Works
            </Badge>
          </motion.div>
          <motion.h2
            variants={fadeUp}
            className="text-4xl md:text-5xl font-display font-black mb-4 tracking-tight"
          >
            Go from idea to shipped in{" "}
            <span className="gradient-text-hero">3 simple steps</span>
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="text-lg text-muted-foreground max-w-xl mx-auto"
          >
            No lengthy onboarding. No consultants needed. Just results.
          </motion.p>
        </motion.div>

        <div className="relative">
          {/* Connecting gradient line */}
          <div className="hidden md:block absolute top-[52px] left-[calc(16.67%+48px)] right-[calc(16.67%+48px)] h-px z-0">
            <motion.div
              initial={{ scaleX: 0 }}
              animate={inView ? { scaleX: 1 } : { scaleX: 0 }}
              transition={{
                delay: 0.6,
                duration: 0.9,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="w-full h-full origin-left"
              style={{
                background:
                  "linear-gradient(90deg, oklch(0.72 0.19 268 / 0.5), oklch(0.72 0.2 189 / 0.6), oklch(0.72 0.19 268 / 0.5))",
              }}
            />
          </div>

          <motion.div
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            variants={staggerSlow}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.num}
                  variants={fadeUp}
                  className="relative flex flex-col items-center text-center group"
                >
                  {/* Glowing number badge */}
                  <div className="relative z-10 mb-7">
                    <motion.div
                      whileHover={{ scale: 1.08 }}
                      className="relative w-[104px] h-[104px] rounded-2xl flex items-center justify-center glass-card-elevated border border-primary/20 cursor-default"
                    >
                      {/* Pulsing glow */}
                      <motion.div
                        animate={{
                          opacity: [0.4, 0.8, 0.4],
                          scale: [1, 1.08, 1],
                        }}
                        transition={{
                          repeat: Number.POSITIVE_INFINITY,
                          duration: 2.5,
                          delay: i * 0.4,
                        }}
                        className="absolute inset-0 rounded-2xl"
                        style={{
                          background:
                            "radial-gradient(circle, oklch(0.72 0.19 268 / 0.15) 0%, transparent 70%)",
                        }}
                      />
                      <div className="relative flex flex-col items-center">
                        <Icon className="w-6 h-6 text-accent mb-1 opacity-70" />
                        <span className="text-2xl font-display font-black gradient-text-hero leading-tight">
                          {step.num}
                        </span>
                      </div>
                    </motion.div>
                  </div>
                  <h3 className="font-display font-bold text-xl mb-3 group-hover:text-foreground transition-smooth">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed max-w-[280px] mx-auto">
                    {step.desc}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ── Stats ─────────────────────────────────────────────────────────────────────

const statData = [
  {
    value: "50,000+",
    label: "Active Users",
    icon: Users,
    color: "text-primary",
  },
  {
    value: "1,000,000+",
    label: "Tasks Completed",
    icon: Check,
    color: "text-emerald-400",
  },
  { value: "99.9%", label: "Uptime SLA", icon: Globe, color: "text-accent" },
  { value: "32", label: "Powerful APIs", icon: Zap, color: "text-accent" },
];

function Stats() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      className="py-28 bg-background border-y border-white/[0.06]"
    >
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={stagger}
          className="text-center mb-14"
        >
          <motion.h2
            variants={fadeUp}
            className="text-4xl md:text-5xl font-display font-black mb-4 tracking-tight"
          >
            Trusted by teams{" "}
            <span className="gradient-text-hero">worldwide</span>
          </motion.h2>
          <motion.p variants={fadeUp} className="text-muted-foreground text-lg">
            Numbers that speak for themselves. No fluff, just results.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={stagger}
          className="grid grid-cols-2 md:grid-cols-4 gap-5"
        >
          {statData.map((s) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.label}
                variants={fadeUp}
                className="group text-center p-7 glass-card-hover relative overflow-hidden cursor-default"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.05] to-accent/[0.05] opacity-0 group-hover:opacity-100 transition-smooth rounded-xl pointer-events-none" />
                <Icon
                  className={`relative w-7 h-7 ${s.color} mx-auto mb-4 group-hover:scale-110 transition-spring`}
                />
                <div className="relative text-4xl md:text-5xl font-display font-black gradient-text-hero mb-1.5">
                  {s.value}
                </div>
                <p className="relative text-muted-foreground text-sm font-medium">
                  {s.label}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

// ── Testimonials ─────────────────────────────────────────────────────────────

const testimonials = [
  {
    name: "Alexandra Chen",
    role: "CTO",
    company: "Nexus AI",
    avatar: "AC",
    stars: 5,
    accentFrom: "from-primary",
    accentTo: "to-accent",
    quote:
      `${APP_NAME} replaced three tools we were paying for. Our sprint velocity went up 40% in the first month — and onboarding new engineers takes half the time it used to.`,
  },
  {
    name: "Marcus Rivera",
    role: "Engineering Manager",
    company: "Orbital Labs",
    avatar: "MR",
    stars: 5,
    accentFrom: "from-accent",
    accentTo: "to-primary",
    quote:
      "The kanban + analytics combo is unreal. I can tell where bottlenecks are before they become problems. My team finally trusts our process.",
  },
  {
    name: "Priya Nair",
    role: "Head of Product",
    company: "Vertex Systems",
    avatar: "PN",
    stars: 5,
    accentFrom: "from-emerald-500",
    accentTo: "to-accent",
    quote:
      `We evaluated Jira, Notion, and Linear. ${APP_NAME} won on every metric. The role-based permissions alone saved us an entire quarter of compliance headaches.`,
  },
  {
    name: "Jordan Blake",
    role: "Founder & CEO",
    company: "Cipher Works",
    avatar: "JB",
    stars: 5,
    accentFrom: "from-amber-500",
    accentTo: "to-primary",
    quote:
      `As a startup, every tool we adopt has to pay for itself 10x. ${APP_NAME} paid for itself in the first week. Our team ships faster, cleaner, and with less stress.`,
  },
];

function Testimonials() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      id="testimonials"
      ref={ref}
      className="py-32 bg-muted/[0.12] border-y border-white/[0.05]"
    >
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={stagger}
          className="text-center mb-16"
        >
          <motion.div variants={fadeUp}>
            <Badge className="mb-5 px-4 py-1.5 bg-primary/10 text-primary border border-primary/25 rounded-full text-sm font-semibold">
              Testimonials
            </Badge>
          </motion.div>
          <motion.h2
            variants={fadeUp}
            className="text-4xl md:text-5xl font-display font-black mb-4 tracking-tight"
          >
            Teams love <span className="gradient-text-hero">{APP_NAME}</span>
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="text-muted-foreground text-lg max-w-xl mx-auto"
          >
            Don't take our word for it — here's what real teams say after
            switching.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={staggerSlow}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              variants={fadeUp}
              data-ocid={`testimonial-${i}`}
              className="group glass-card-hover p-6 flex flex-col gap-4 cursor-default"
            >
              {/* Stars */}
              <div className="flex gap-1">
                {Array.from({ length: t.stars }, (_, s) => (
                  <Star
                    key={`${t.name}-star-${String(s)}`}
                    className="w-4 h-4 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>

              {/* Quote */}
              <p className="text-sm text-muted-foreground leading-relaxed flex-1 group-hover:text-muted-foreground/90 transition-smooth">
                "{t.quote}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-3 border-t border-white/[0.08]">
                {/* Avatar with ring accent */}
                <div
                  className={`p-[2px] rounded-full bg-gradient-to-br ${t.accentFrom} ${t.accentTo} shrink-0`}
                >
                  <div className="w-9 h-9 rounded-full bg-card flex items-center justify-center text-white text-xs font-bold">
                    <span className="gradient-text-hero text-xs font-black">
                      {t.avatar}
                    </span>
                  </div>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{t.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {t.role} · {t.company}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ── Pricing ───────────────────────────────────────────────────────────────────

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    desc: "Perfect for solo developers and small experiments.",
    popular: false,
    features: [
      "3 projects",
      "5 team members",
      "Basic kanban board",
      "1 GB storage",
      "Community support",
    ],
    cta: "Get Started Free",
    href: "/register",
  },
  {
    name: "Pro",
    price: "$12",
    period: "/month",
    desc: "For growing teams that ship fast and need every edge.",
    popular: true,
    features: [
      "Unlimited projects",
      "50 team members",
      "Advanced analytics",
      "Priority support",
      "Custom integrations",
      "10 GB storage",
      "API access",
    ],
    cta: "Start Pro Trial",
    href: "/register",
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    desc: "For organizations with scale, compliance, and custom needs.",
    popular: false,
    features: [
      "Unlimited everything",
      "SSO / SAML login",
      "Dedicated success manager",
      "SLA guarantee",
      "Custom integrations",
      "Unlimited storage",
      "On-prem option",
    ],
    cta: "Contact Sales",
    href: "/register",
  },
];

function Pricing() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      id="pricing"
      ref={ref}
      className="py-32 bg-background relative overflow-hidden"
    >
      {/* Accent glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-primary/[0.04] blur-3xl rounded-full pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-6">
        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={stagger}
          className="text-center mb-16"
        >
          <motion.div variants={fadeUp}>
            <Badge className="mb-5 px-4 py-1.5 bg-accent/10 text-accent border border-accent/25 rounded-full text-sm font-semibold">
              Pricing
            </Badge>
          </motion.div>
          <motion.h2
            variants={fadeUp}
            className="text-4xl md:text-5xl font-display font-black mb-4 tracking-tight"
          >
            Simple, transparent{" "}
            <span className="gradient-text-hero">pricing</span>
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="text-muted-foreground text-lg max-w-xl mx-auto"
          >
            No hidden fees. No surprise bills. Cancel anytime. Start free, scale
            as you grow.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={staggerSlow}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch"
        >
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              variants={fadeUp}
              custom={i}
              data-ocid={`pricing-${plan.name.toLowerCase()}`}
              className={`relative flex flex-col rounded-2xl transition-spring ${plan.popular
                ? "gradient-border bg-card border-0 shadow-premium md:scale-[1.03] md:-translate-y-1"
                : "glass-card hover:border-primary/25 hover:-translate-y-1 hover:shadow-elevated"
                }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                  <Badge className="px-5 py-1 bg-gradient-to-r from-primary to-accent text-white border-0 shadow-lg shadow-primary/35 text-xs font-bold tracking-wide">
                    ✦ Most Popular
                  </Badge>
                </div>
              )}

              {plan.popular && (
                <div
                  className="absolute inset-0 rounded-2xl opacity-40 pointer-events-none"
                  style={{
                    background:
                      "radial-gradient(ellipse at 50% 0%, oklch(0.72 0.19 268 / 0.12) 0%, transparent 60%)",
                  }}
                />
              )}

              <div className="relative p-8 flex flex-col flex-1">
                <div className="mb-7">
                  <h3 className="font-display font-bold text-xl mb-1">
                    {plan.name}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-5">
                    {plan.desc}
                  </p>
                  <div className="flex items-end gap-1.5">
                    <span className="text-5xl font-display font-black gradient-text-hero">
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className="text-muted-foreground text-sm mb-2">
                        {plan.period}
                      </span>
                    )}
                  </div>
                </div>

                <ul className="flex-1 space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-emerald-400" />
                      </div>
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant={plan.popular ? "default" : "outline"}
                    size="lg"
                    className={`w-full rounded-xl font-bold h-12 ${plan.popular
                      ? "bg-gradient-to-r from-primary to-accent text-white border-0 hover:opacity-95 shadow-lg shadow-primary/30"
                      : "hover:border-primary/40 hover:bg-primary/5"
                      }`}
                    asChild
                  >
                    <a href={plan.href}>{plan.cta}</a>
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ── FAQ ───────────────────────────────────────────────────────────────────────

const faqs = [
  {
    q: `What is ${APP_NAME}?`,
    a: `${APP_NAME} is a premium project management platform built for modern engineering and product teams. It combines kanban boards, role-based access, analytics, and collaboration tools into a single, fast, beautiful workspace.`,
  },
  {
    q: "How does the free plan work?",
    a: "The free plan gives you 3 projects and up to 5 team members — forever, no credit card required. When you're ready to scale, upgrading to Pro takes 30 seconds.",
  },
  {
    q: "Can I import from Trello or Jira?",
    a: `Yes ${APP_NAME} supports one-click imports from Trello, Jira, Asana, and Linear. Your boards, cards, and members migrate automatically with zero downtime.`,
  },
  {
    q: "Is my data secure?",
    a: "Your data lives on the Internet Computer — a decentralized, blockchain-backed infrastructure with cryptographic guarantees. No single point of failure, no cloud vendor lock-in.",
  },
  {
    q: "How does team management work?",
    a: "Invite teammates by sharing a link or email. Assign them Owner, Admin, or Member roles per project. Permissions cascade automatically so you never have to configure them manually again.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Absolutely. Cancel from your settings page at any time — no questions, no penalties, no dark patterns. Your data remains exportable for 30 days after cancellation.",
  },
];

function FAQ() {
  const [openIdx, setOpenIdx] = useState(null);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      id="faq"
      ref={ref}
      className="py-32 bg-muted/[0.12] border-y border-white/[0.05]"
    >
      <div className="max-w-3xl mx-auto px-6">
        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={stagger}
          className="text-center mb-16"
        >
          <motion.div variants={fadeUp}>
            <Badge className="mb-5 px-4 py-1.5 bg-primary/10 text-primary border border-primary/25 rounded-full text-sm font-semibold">
              FAQ
            </Badge>
          </motion.div>
          <motion.h2
            variants={fadeUp}
            className="text-4xl md:text-5xl font-display font-black mb-4 tracking-tight"
          >
            Got <span className="gradient-text-hero">questions?</span>
          </motion.h2>
          <motion.p variants={fadeUp} className="text-muted-foreground text-lg">
            Everything you need to know. Can't find an answer? Reach our support
            team in under 2 minutes.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={stagger}
          className="space-y-2.5"
        >
          {faqs.map((faq, i) => (
            <motion.div
              key={faq.q}
              variants={fadeUp}
              data-ocid={`faq-${i}`}
              className={`glass-card overflow-hidden rounded-xl border transition-spring ${openIdx === i
                ? "border-primary/30 bg-primary/[0.03] shadow-glow-subtle"
                : "hover:border-white/20 dark:hover:border-white/15"
                }`}
            >
              <button
                type="button"
                className="w-full flex items-center justify-between px-6 py-5 text-left gap-4 group"
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                aria-expanded={openIdx === i}
              >
                <span
                  className={`font-semibold text-sm transition-smooth ${openIdx === i ? "text-foreground" : "text-foreground/80 group-hover:text-foreground"}`}
                >
                  {faq.q}
                </span>
                <motion.div
                  animate={{ rotate: openIdx === i ? 180 : 0 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-smooth ${openIdx === i
                    ? "bg-primary/20 text-primary"
                    : "bg-muted/40 text-muted-foreground"
                    }`}
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </motion.div>
              </button>
              <AnimatePresence initial={false}>
                {openIdx === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="px-6 pb-6 text-sm text-muted-foreground leading-relaxed border-t border-white/[0.06] pt-4 mx-0">
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ── Final CTA ─────────────────────────────────────────────────────────────────

function FinalCTA() {
  const { isAuthenticated } = useAuth();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-32 relative overflow-hidden bg-background">
      {/* Dramatic gradient bg */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(ellipse at 50% 60%, oklch(0.72 0.19 268 / 0.13) 0%, oklch(0.72 0.2 189 / 0.07) 45%, transparent 75%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "radial-gradient(circle, oklch(var(--foreground)) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      <div className="relative max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={stagger}
        >
          <motion.div variants={fadeIn} className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/25 shadow-glow-subtle mx-auto">
              <Zap className="w-9 h-9 text-primary" />
            </div>
          </motion.div>

          <motion.h2
            variants={fadeUp}
            className="text-4xl md:text-6xl font-display font-black mb-6 leading-[1.08] tracking-tight"
          >
            Ready to transform{" "}
            <span className="gradient-text-hero">your workflow?</span>
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="text-xl text-muted-foreground mb-12 max-w-xl mx-auto leading-relaxed"
          >
            Join 50,000+ teams already shipping faster with {APP_NAME}. Set up in
            5 minutes. No credit card required.
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10"
          >
            {isAuthenticated ? (
              <motion.div
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
              >
                <Button
                  size="lg"
                  asChild
                  data-ocid="final-cta-dashboard"
                  className="px-10 h-14 text-base bg-gradient-to-r from-primary to-accent text-white border-0 hover:opacity-95 shadow-xl shadow-primary/35 rounded-xl font-bold"
                >
                  <a href="/dashboard">
                    Jump Back into Dashboard
                    <ArrowRight className="ml-2 w-4.5 h-4.5 w-[18px] h-[18px]" />
                  </a>
                </Button>
              </motion.div>
            ) : (
              <>
                <motion.div
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Button
                    size="lg"
                    asChild
                    data-ocid="final-cta-btn"
                    className="px-10 h-14 text-base bg-gradient-to-r from-primary to-accent text-white border-0 hover:opacity-95 shadow-xl shadow-primary/35 rounded-xl font-bold"
                  >
                    <a href="/register">
                      Start for Free{" "}
                      <ArrowRight className="ml-2 w-4.5 h-4.5 w-[18px] h-[18px]" />
                    </a>
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Button
                    size="lg"
                    variant="outline"
                    asChild
                    className="px-8 h-14 text-base border border-white/20 hover:border-primary/40 hover:bg-primary/5 rounded-xl font-semibold backdrop-blur-sm"
                  >
                    <a href="/login">Sign In Instead</a>
                  </Button>
                </motion.div>
              </>
            )}
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground"
          >
            {[
              "Free forever plan",
              "No credit card",
              "Cancel anytime",
              "Setup in 5 min",
            ].map((item) => (
              <span key={item} className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                {item}
              </span>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────

const footerLinks = {
  Product: ["Features", "Pricing", "API Docs"],
  Legal: ["Privacy Policy", "Terms of Service", "Security"],
};

function Footer() {
  const year = new Date().getFullYear();
  const hostname =
    typeof window !== "undefined"
      ? encodeURIComponent(window.location.hostname)
      : "";

  return (
    <footer className="relative bg-card border-t border-white/[0.07] overflow-hidden">
      {/* Subtle top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 pt-16 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="lg:col-span-2 flex flex-col items-center sm:items-start text-center sm:text-left">
            <a
              href="/"
              className="flex items-center gap-2.5 font-display font-bold text-xl mb-6 group w-fit"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow-subtle group-hover:shadow-glow transition-smooth">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <span className="gradient-text-hero tracking-tight">
                {APP_NAME}
              </span>
            </a>
            <p className="text-sm text-muted-foreground leading-relaxed mb-7 max-w-sm">
              The modern project management platform for high-performing teams
              that want to ship faster and collaborate better.
            </p>
            <div className="flex items-center gap-2.5">
              {[
                { label: "GitHub", abbr: "GH" },
                { label: "Twitter", abbr: "TW" },
                { label: "LinkedIn", abbr: "LI" },
                { label: "YouTube", abbr: "YT" },
              ].map((s) => (
                <button
                  key={s.label}
                  type="button"
                  aria-label={s.label}
                  className="w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center text-xs text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-primary/5 transition-smooth font-mono font-bold"
                >
                  {s.abbr}
                </button>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([col, links]) => (
            <div key={col} className="text-center sm:text-left">
              <h4 className="font-display font-bold text-xs uppercase tracking-widest mb-6 text-foreground/90">
                {col}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="/#"
                      className="text-sm text-muted-foreground hover:text-foreground transition-smooth"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/[0.06] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>
            © {year} {APP_NAME}. All rights reserved.
          </p>
          <p className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            All systems operational
          </p>
        </div>
      </div>
    </footer>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navbar />
      <Hero />
      <SocialProof />
      <Features />
      <HowItWorks />
      <Stats />
      <Testimonials />
      <Pricing />
      <FAQ />
      <FinalCTA />
      <Footer />
    </div>
  );
}
