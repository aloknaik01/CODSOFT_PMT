// page-fixes.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = (p) => path.join(__dirname, 'src', p);

// ── alert.jsx ─────────────────────────────────────────────────────────────────
fs.writeFileSync(src('components/ui/alert.jsx'), `import { cva } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        destructive: "text-destructive bg-card [&>svg]:text-current *:data-[slot=alert-description]:text-destructive/90",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

function Alert({ className, variant, ...props }) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }) {
  return (
    <div
      data-slot="alert-title"
      className={cn("col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight", className)}
      {...props}
    />
  );
}

function AlertDescription({ className, ...props }) {
  return (
    <div
      data-slot="alert-description"
      className={cn("text-muted-foreground col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed", className)}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription };
`);
console.log('✓ alert.jsx');

// ── badge.jsx ─────────────────────────────────────────────────────────────────
let badge = fs.readFileSync(src('components/ui/badge.jsx'), 'utf8');
badge = badge.replace(/\}\s*&\s*VariantProps<typeof badgeVariants>\s*&\s*\{[^}]*\}\s*\)/g, '})');
badge = badge.replace(/\}\s*VariantProps<typeof badgeVariants>\s*&\s*\{[^}]*\}\s*\)/g, '})');
badge = badge.replace(/VariantProps<typeof badgeVariants>\s*&\s*\{[^}]*\}/g, '');
badge = badge.replace(/\{\s*asChild\??\s*\}\s*\)/g, ')');
fs.writeFileSync(src('components/ui/badge.jsx'), badge);
console.log('✓ badge.jsx');

// ── button.jsx ────────────────────────────────────────────────────────────────
let button = fs.readFileSync(src('components/ui/button.jsx'), 'utf8');
button = button.replace(/\}\s*&?\s*VariantProps<typeof buttonVariants>\s*&?\s*\{[^}]*\}\s*\)/g, '})');
button = button.replace(/VariantProps<typeof \w+>\s*&?\s*\{?[^}]*\}?/g, '');
fs.writeFileSync(src('components/ui/button.jsx'), button);
console.log('✓ button.jsx');

// ── pagination.jsx ────────────────────────────────────────────────────────────
let pag = fs.readFileSync(src('components/ui/pagination.jsx'), 'utf8');
pag = pag.replace(/\}\s*&\s*Pick<[^>]+>\s*&\s*[^)]+\)/g, '})');
pag = pag.replace(/Pick<[^>]+>/g, '');
pag = pag.replace(/&\s*React\.ComponentProps<[^>]+>/g, '');
fs.writeFileSync(src('components/ui/pagination.jsx'), pag);
console.log('✓ pagination.jsx');

// ── chart.jsx ─────────────────────────────────────────────────────────────────
let chart = fs.readFileSync(src('components/ui/chart.jsx'), 'utf8');
// Fix `React.ComponentProps<"div"> & { ... }` in function params
chart = chart.replace(/React\.ComponentProps<"div">\s*&\s*\{/g, '{');
chart = chart.replace(/React\.ComponentProps<typeof RechartsPrimitive\.\w+>\s*&\s*\{/g, '{');
chart = chart.replace(/React\.ComponentProps<typeof RechartsPrimitive\.\w+>/g, '');
// Fix `children: React.ComponentProps<...>` line
chart = chart.replace(/^\s*children:\s*React\.ComponentProps<[\s\S]*?;\s*$/gm, '');
fs.writeFileSync(src('components/ui/chart.jsx'), chart);
console.log('✓ chart.jsx');

// ── ProjectsPage.jsx ──────────────────────────────────────────────────────────
let pp = fs.readFileSync(src('pages/ProjectsPage.jsx'), 'utf8');

// Fix `const defaultForm= {` — missing closing brace (was eaten by TS removal)
pp = pp.replace(
  /const defaultForm=\s*\{[^}]+\n\nconst STATUS_RIBBON=/,
  `const defaultForm = {
  name: "",
  description: "",
  dueDate: "",
  status: "active",
  color: "#8b5cf6",
};

const STATUS_RIBBON =`
);

// Fix `const STATUS_RIBBON= {` needs closing brace
pp = pp.replace(
  /const STATUS_RIBBON=\s*\{\s*active:[^}]+archived:[^}]+\n\n\/\/ /,
  `const STATUS_RIBBON = {
  active: "bg-primary",
  completed: "bg-emerald-500",
  archived: "bg-muted-foreground",
};

// `
);

// Fix `const FILTER_TABS: { key: FilterTab; label }[] =` → `const FILTER_TABS =`
pp = pp.replace(/const FILTER_TABS:\s*\{[^}]+\}\[\]\s*=/, 'const FILTER_TABS =');

// Fix `(k: keyof ProjectFormData, v) =>` → `(k, v) =>`
pp = pp.replace(/\(k:\s*keyof\s*\w+,\s*v\)\s*=>/g, '(k, v) =>');

// Fix `const [form, setForm] = useState(initial ?? defaultForm),` (comma instead of ;)
pp = pp.replace(/useState\(initial \?\? defaultForm\),\s*\n/, 'useState(initial ?? defaultForm);\n');

// Fix `if (!editProject) return,` → `;`
pp = pp.replace(/if \(!editProject\) return,/, 'if (!editProject) return;');

// Fix incomplete handleEdit function (missing closing braces)
pp = pp.replace(
  /const handleEdit = \(form\) =>\s*\{\s*if \(!editProject\) return;\s*updateMutation\.mutate\(\{\s*id: editProject\.id,\s*payload: \{\s*name: form\.name,\s*description: form\.description,\s*dueDate: form\.dueDate \|\| undefined,\s*status: form\.status,\s*\n\s*\};\s*\n/,
  `const handleEdit = (form) => {
    if (!editProject) return;
    updateMutation.mutate({
      id: editProject.id,
      payload: {
        name: form.name,
        description: form.description,
        dueDate: form.dueDate || undefined,
        status: form.status,
        color: form.color,
      },
    });
  };

`
);

// Fix `const editFormData=` with missing closing
pp = pp.replace(
  /const editFormData=\s*editProject[\s\S]*?color: editProject\.color \?\? PROJECT_COLORS\[0\] \}\s*;/,
  `const editFormData = editProject
    ? {
        name: editProject.name,
        description: editProject.description,
        dueDate: editProject.dueDate ? editProject.dueDate.substring(0, 10) : "",
        status: editProject.status,
        color: editProject.color ?? PROJECT_COLORS[0],
      }
    : defaultForm;`
);

fs.writeFileSync(src('pages/ProjectsPage.jsx'), pp);
console.log('✓ ProjectsPage.jsx');

// ── RegisterPage.jsx ──────────────────────────────────────────────────────────
let reg = fs.readFileSync(src('pages/RegisterPage.jsx'), 'utf8');

// Remove stray `};` after STEPS array
reg = reg.replace(/\];\n\n\};\n\nfunction AnimatedOrb/, '];\n\nfunction AnimatedOrb');

// Fix validate function signature: `(fields?: (keyof FormErrors)[])` → `(fields)`
reg = reg.replace(/const validate = \(fields\?\??\s*:\s*\([^)]*\)\[\]\)\s*=>/g, 'const validate = (fields) =>');
reg = reg.replace(/const validate = \(fields\?\)\s*=>/g, 'const validate = (fields) =>');

// Fix: `fields ?? ([...] as const)` → `fields ?? [...]`
reg = reg.replace(/fields\s*\?\?\s*\(\["name", "email", "password", "confirmPassword", "terms"\]\s*as\s*const\)/,
  'fields ?? ["name", "email", "password", "confirmPassword", "terms"]');

// Fix `const e= { ...errors }` → `const e = { ...errors }`
reg = reg.replace(/const e=\s*\{/g, 'const e = {');

// Fix ternary errors without else case: `e.name = cond ? "msg" ;` → `e.name = cond ? "msg" : undefined;`
reg = reg.replace(/e\.(\w+) = ([^;]+)\s*\?\s*"([^"]+)"\s*;/g, 'e.$1 = $2 ? "$3" : undefined;');

// Fix `ev.preventDefault(),` → `ev.preventDefault();`
reg = reg.replace(/ev\.preventDefault\(\),/g, 'ev.preventDefault();');
reg = reg.replace(/goNext\(\),\n\s*return;/g, 'goNext();\n      return;');

// Fix toast calls missing closing `})`
reg = reg.replace(
  /toast\.success\("Account created 🎉", \{\s*\n\s*void navigate/,
  'toast.success("Account created 🎉");\n      void navigate'
);
reg = reg.replace(
  /toast\.error\("Registration failed", \{\s*\n\s*\} finally/,
  'toast.error("Registration failed");\n    } finally'
);

fs.writeFileSync(src('pages/RegisterPage.jsx'), reg);
console.log('✓ RegisterPage.jsx');

// ── SettingsPage.jsx ──────────────────────────────────────────────────────────
let set = fs.readFileSync(src('pages/SettingsPage.jsx'), 'utf8');

// Fix `(k: keyof typeof prefs) =>` → `(k) =>`
set = set.replace(/\(k:\s*keyof\s*typeof\s*\w+\)\s*=>/g, '(k) =>');

// Fix `const [form, setForm] = useState(...),` (comma)
set = set.replace(/useState\(.*?\),\s*\n(\s*const)/g, (m, next) => m.replace(/,\s*\n/, ';\n') );
set = set.replace(/useQueryClient\(\),/g, 'useQueryClient();');
set = set.replace(/useState\(false\),\s*\n(\s*return)/g, 'useState(false);\n  return');
set = set.replace(/useState\(false\),\s*\n/g, 'useState(false);\n');

// Fix `prefs` object missing closing brace
set = set.replace(
  /const \[prefs, setPrefs\] = useState\(\{\s*emailTasks: true,[\s\S]*?inAppMentions: true,\s*\n\s*\n\s*const toggle/,
  `const [prefs, setPrefs] = useState({
    emailTasks: true,
    emailComments: true,
    emailDeadlines: false,
    emailWeekly: true,
    inAppTasks: true,
    inAppComments: true,
    inAppMentions: true,
    inAppDeadlines: true,
  });
  const toggle`
);

// Remove `} as const;` at end of NAV array
set = set.replace(/\]\s*as\s*const\s*;/, '];');

// Fix `accentMap` object missing closing brace
set = set.replace(
  /const accentMap = \{\s*primary:[^,]+,\s*destructive:[^,]+,\s*\n\s*\n\s*return/,
  `const accentMap = {
    primary: "bg-primary/15 text-primary",
    destructive: "bg-destructive/15 text-destructive",
  };
  return`
);

fs.writeFileSync(src('pages/SettingsPage.jsx'), set);
console.log('✓ SettingsPage.jsx');

console.log('\n✅ All targeted page fixes done!');
