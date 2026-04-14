// final-fix.mjs — Targeted fixes for remaining TS artifacts
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.join(__dirname, 'src');

// ─── sonner.jsx ───────────────────────────────────────────────────────────────
const sonnerPath = path.join(srcDir, 'components/ui/sonner.jsx');
fs.writeFileSync(sonnerPath, `import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

const Toaster = ({ ...props }) => {
  const { theme = "system" } = useTheme();
  return (
    <Sonner
      theme={theme}
      className="toaster group"
      style={{
        "--normal-bg": "var(--popover)",
        "--normal-text": "var(--popover-foreground)",
        "--normal-border": "var(--border)",
      }}
      {...props}
    />
  );
};

export { Toaster };
`);
console.log('✓ Fixed sonner.jsx');

// ─── ProjectDetailPage.jsx — fix COLUMNS const and TaskFormModal set() ────────
const pdpPath = path.join(srcDir, 'pages/ProjectDetailPage.jsx');
let pdp = fs.readFileSync(pdpPath, 'utf8');

// Fix COLUMNS typed array declaration
pdp = pdp.replace(
  /const COLUMNS:\s*\{[\s\S]*?\}\[\]\s*=/,
  'const COLUMNS ='
);
// Remove inline TS object type `{ id: TaskStatus; label; ... }[]`
pdp = pdp.replace(/:\s*\{\s*id:\s*TaskStatus;[^}]*\}\[\]/g, '');
// Fix `const set = (k: keyof TaskFormData, v) =>` → `const set = (k, v) =>`
pdp = pdp.replace(/const set = \(k:\s*keyof\s*\w+,\s*v\)/g, 'const set = (k, v)');
// Fix missing AnimatePresence opening tag in KanbanCol
pdp = pdp.replace(
  /\{tasks\.map\((task\)) =>/,
  '<AnimatePresence initial={false}>\n          {tasks.map(($1) =>'
);
fs.writeFileSync(pdpPath, pdp, 'utf8');
console.log('✓ Fixed ProjectDetailPage.jsx');

// ─── sidebar.jsx — full rewrite of broken sections ────────────────────────────
const sidebarPath = path.join(srcDir, 'components/ui/sidebar.jsx');
let sb = fs.readFileSync(sidebarPath, 'utf8');

// Fix broken import `import * "react"` → `import * as React from "react"`
sb = sb.replace(/^import \* "react";$/m, 'import * as React from "react";');

// Remove floating TS context type block (lines like `state: "expanded" | "collapsed"; open; setOpen: undefined;...`)
sb = sb.replace(
  /\s*state:\s*"expanded"\s*\|\s*"collapsed";\s*\n\s*open;\s*\n\s*setOpen:\s*\w+;\s*\n\s*openMobile;\s*\n\s*setOpenMobile:\s*\w+;\s*\n\s*isMobile;\s*\n\s*toggleSidebar:\s*\w+;\s*\n\}\s*;/,
  ''
);

// Fix broken setOpen callback param `(value | ((value) => boolean)) =>`
sb = sb.replace(
  /\(value\s*\|\s*\(\(value\)\s*=>\s*boolean\)\)\s*=>/,
  '(value) =>'
);

// Remove TS type annotations from function signatures: `}: React.ComponentProps<"X"> & { ... })`
sb = sb.replace(/\}\s*:\s*React\.ComponentProps<"[^"]*">\s*&\s*\{[^}]*\}\s*\)/g, '})');
sb = sb.replace(/\}\s*:\s*React\.ComponentProps<"[^"]*">\s*\)/g, '})');
sb = sb.replace(/\}\s*:\s*React\.ComponentProps<typeof \w+>\s*\)/g, '})');

// Remove: `} & VariantProps<typeof sidebarMenuButtonVariants>)`
sb = sb.replace(/\}\s*&\s*VariantProps<typeof \w+>\s*\)/g, '})');

// Remove standalone `: React.ComponentProps<"X">` in function params
sb = sb.replace(/:\s*React\.ComponentProps<"[^"]*">/g, '');
sb = sb.replace(/:\s*React\.ComponentProps<\w+>/g, '');

// Remove `asChild?; isActive?;` style optional prop declarations in function bodies
sb = sb.replace(/^\s+\w+\?;\s*$/gm, '');

// Remove `tooltip? | React.ComponentProps<...>` type annotation lines
sb = sb.replace(/\s*tooltip\?\s*\|\s*React\.ComponentProps<[^>]+>;\s*/g, '');

// Remove `size?: "sm" | "md";` style type lines inside function bodies
sb = sb.replace(/^\s+\w+\?:\s*"[^"]*"\s*\|\s*"[^"]*";\s*$/gm, '');

// Remove `: (open) => void` in callback type annotations
sb = sb.replace(/:\s*\(open\)\s*=>\s*void/g, '');

// Clean up extra blank lines
sb = sb.replace(/\n{3,}/g, '\n\n');

fs.writeFileSync(sidebarPath, sb, 'utf8');
console.log('✓ Fixed sidebar.jsx');

// ─── AuthContext.jsx — fix `payload: RegisterCredentials` ─────────────────────
const authPath = path.join(srcDir, 'contexts/AuthContext.jsx');
let auth = fs.readFileSync(authPath, 'utf8');
auth = auth.replace(/\(payload:\s*\w+\)/g, '(payload)');
auth = auth.replace(/\(email:\s*\w+\)/g, '(email)');
auth = auth.replace(/\(data:\s*[A-Za-z<>]+\)/g, '(data)');
auth = auth.replace(/:\s*AuthContextType/g, '');
fs.writeFileSync(authPath, auth, 'utf8');
console.log('✓ Fixed AuthContext.jsx');

// ─── Badge.jsx — fix `{ priority }: { priority: Priority }` ──────────────────
const badgePath = path.join(srcDir, 'components/custom/Badge.jsx');
let badge = fs.readFileSync(badgePath, 'utf8');
badge = badge.replace(/\(\{?\s*(\w+)\s*\}?\s*:\s*\{[^}]*\}\)/g, '({ $1 })');
badge = badge.replace(/:\s*Record<[A-Za-z]+,\s*string>/g, '');
badge = badge.replace(/:\s*Record<string,\s*string>/g, '');
fs.writeFileSync(badgePath, badge, 'utf8');
console.log('✓ Fixed Badge.jsx');

// ─── Generic pass on all JSX/JS: remove remaining `Record<...>` / `Array<...>` used as type annotations ──
function getAllFiles(dir) {
  const result = [];
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) result.push(...getAllFiles(full));
    else if (item.name.endsWith('.jsx') || item.name.endsWith('.js')) result.push(full);
  }
  return result;
}

let genericFixed = 0;
for (const f of getAllFiles(srcDir)) {
  let content = fs.readFileSync(f, 'utf8');
  const before = content;

  // `const foo: Record<X, Y> =` → `const foo =`
  content = content.replace(/\b(const|let|var)\s+(\w+):\s*Record<[^>]+>\s*=/g, '$1 $2 =');
  content = content.replace(/\b(const|let|var)\s+(\w+):\s*Array<[^>]+>\s*=/g, '$1 $2 =');

  // `mutationFn: (payload: SomeType) =>` → `mutationFn: (payload) =>`
  content = content.replace(/mutationFn:\s*\((\w+):\s*[A-Za-z<>\[\]]+\)\s*=>/g, 'mutationFn: ($1) =>');
  content = content.replace(/mutationFn:\s*\(\{\s*(\w+),?\s*(\w+)?\s*\}:\s*\{[^}]*\}\)\s*=>/g, (_, a, b) =>
    b ? `mutationFn: ({ ${a}, ${b} }) =>` : `mutationFn: ({ ${a} }) =>`
  );

  // `(data: Partial<{...}>) =>` → `(data) =>`
  content = content.replace(/\((\w+):\s*Partial<[^>]+>\)\s*=>/g, '($1) =>');

  // `(form: TaskFormData) =>` → `(form) =>`
  content = content.replace(/\((\w+):\s*[A-Z]\w+\)\s*=>/g, '($1) =>');

  // `{ id; payload: X }` style params
  content = content.replace(/\(\{\s*(\w+);\s*(\w+):\s*[A-Za-z<>\[\]]+\s*\}\)/g, '({ $1, $2 })');

  // Remove `onMove: (task: Task, status: TaskStatus) => void;`
  content = content.replace(/\w+:\s*\(task:\s*\w+,\s*status:\s*\w+\)\s*=>\s*void\s*;/g, '');
  content = content.replace(/\w+:\s*\(status:\s*\w+\)\s*=>\s*void\s*;/g, '');
  content = content.replace(/\w+:\s*\(\)\s*=>\s*void\s*;/g, '');

  // Semicolons used as commas in object literals from TS interface remnants
  content = content.replace(/\{([^}]+)\}/g, (match) => {
    // Only inside JSX/JS value contexts, not inside className strings
    if (match.includes('"') || match.includes("'") || match.includes('`')) return match;
    return match.replace(/;\s*\n(\s*\w)/g, ',\n$1');
  });

  if (content !== before) {
    fs.writeFileSync(f, content, 'utf8');
    genericFixed++;
  }
}
console.log(`✓ Generic pass: fixed ${genericFixed} additional files`);
console.log('\n✅ Final fix complete!');
