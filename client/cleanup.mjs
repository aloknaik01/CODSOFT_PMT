// cleanup.mjs — Second-pass TypeScript cleanup for JSX files
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.join(__dirname, 'src');

function getAllJSX(dir) {
  const result = [];
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) result.push(...getAllJSX(full));
    else if (item.name.endsWith('.jsx') || item.name.endsWith('.js')) result.push(full);
  }
  return result;
}

function clean(code) {
  // ── Remove remaining `import type` lines ──
  code = code.replace(/^import\s+type\s+\{[^}]*\}\s+from\s+['"][^'"]*['"];?\s*$/gm, '');
  code = code.replace(/^import\s+type\s+\S+\s+from\s+['"][^'"]*['"];?\s*$/gm, '');

  // ── Remove `type Xxx` from named imports { type Foo, Bar } ──
  code = code.replace(/import\s*\{([^}]+)\}\s*from/g, (_m, imports) => {
    const parts = imports.split(',').map(s => s.trim()).filter(s => s && !s.startsWith('type '));
    if (!parts.length) return '// removed-type-import from';
    return `import { ${parts.join(', ')} } from`;
  });
  code = code.replace(/^\/\/ removed-type-import from\s*['"][^'"]*['"];?\s*$/gm, '');

  // ── Remove trailing `,  }` artifact from cleaned imports ──
  code = code.replace(/,\s+\}/g, ' }');

  // ── Remove `as string`, `as object`, `as T`, `as React.X` casts ──
  code = code.replace(/\s+as\s+(?:string|number|boolean|object|null|undefined|never|any|unknown|React\.\w+|keyof\s+\w+|typeof\s+\w+)(?=[\s,;)\]}>])/g, '');

  // ── Remove TypeScript generic type parameters on function calls/refs ──
  // e.g. request<null>(...) → request(...)
  // e.g. useState<Foo>( → useState(
  // e.g. useRef<HTMLDiv>( → useRef(
  // e.g. Map<string, string> → Map
  code = code.replace(/\b(request|requestRaw|useState|useRef|useContext|createContext|useMutation|useQuery|Map|Set)\s*<[^>()]*>\s*\(/g, '$1(');

  // ── Remove `: Type` annotations in function params/returns ──
  // Pattern: `: SomeType` where SomeType is identifier or generics
  // Remove return type: `): Type {` or `): Type;`
  code = code.replace(/\)\s*:\s*[A-Z][A-Za-z0-9_<>\[\]|&,\s.]*\s*(?=[{;])/g, ') ');
  code = code.replace(/\)\s*:\s*(?:string|number|boolean|void|null|undefined|never|any|unknown)\s*(?=[{;])/g, ') ');

  // ── Remove param type annotations: `(param: Type)` ──
  // Destructure pattern: `({ onClose }: { onClose: () => void })`
  code = code.replace(/\(\s*\{([^}]+)\}\s*:\s*\{[^}]*\}\s*\)/g, '({ $1 })');

  // ── Fix `function Foo({ bar }: { bar: Type })` → `function Foo({ bar })` ──
  code = code.replace(/(function\s+\w+\s*\(\s*\{[^}]*\})\s*:\s*\{[^}]*\}/g, '$1');

  // ── Remove `payload: Type` from arrow fn params ──
  code = code.replace(/\(([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:\s*[A-Z][A-Za-z0-9_<>\[\]|&,.]+\)/g, '($1)');

  // ── Remove `: Type` from variable declarations ──
  // e.g. `let payload: UpdateTaskPayload;` → `let payload;`
  code = code.replace(/\b(let|const|var)\s+(\w+)\s*:\s*[A-Za-z][A-Za-z0-9_<>\[\]|&,.\s]*(?=\s*[=;])/g, '$1 $2');

  // ── Remove type annotations in object destructuring ──
  // e.g. `}: { id; payload: Partial<CreateTaskPayload> }) =>` → `}) =>`
  code = code.replace(/\}\s*:\s*\{[^}]*\}\s*\)\s*=>/g, '}) =>');
  code = code.replace(/\}\s*:\s*\{[^}]*\}\s*\)/g, '})');

  // ── Remove generic constraints from Record<X,Y> and other generics used as values ──
  // Record<string, string> used in value position (after =)
  code = code.replace(/:\s*Record<[^>]*>/g, ':');
  code = code.replace(/:\s*Array<[^>]*>/g, ':');

  // ── Remove remaining inline `: Type` before `=` in assignments ──
  code = code.replace(/:\s*[A-Z][A-Za-z0-9_<>\[\]|&,.]+(?=\s*=(?!=))/g, '');

  // ── Remove optional param marker `param?,` → `param,` and `param?` → `param` ──
  code = code.replace(/(\w+)\?(\s*[,)])/g, '$1$2');
  code = code.replace(/(\w+)\?(\s*=)/g, '$1$2');

  // ── Remove `{ id; payload: X }` inline type in arrow fn params ──
  // These look like `{ id, payload }` after TS stripping
  code = code.replace(/\{\s*(\w+)\s*;\s*(\w+)\s*:\s*[A-Za-z<>\[\]|& ,]+\}/g, '{ $1, $2 }');
  code = code.replace(/\{\s*(\w+)\s*;\s*(\w+)\s*:\s*[A-Za-z<>\[\]|& ,]+;\s*\}/g, '{ $1, $2 }');

  // ── Fix semicolons used as commas in destructuring (from TS interface syntax) ──
  // `{ id; status }` → `{ id, status }`
  code = code.replace(/\{\s*(\w+)\s*;\s*(\w+)\s*\}/g, '{ $1, $2 }');
  code = code.replace(/\{\s*(\w+)\s*;\s*\}/g, '{ $1 }');

  // ── Remove `<T>` generics on JSX-incompatible positions ──
  code = code.replace(/<([A-Z][A-Za-z0-9]*)>(?!\s*[</\w])/g, '');

  // ── Remove bare `priority: Prior` / `status: Task` leftover param annotations ──
  code = code.replace(/,\s*(priority|status|role)\s*:\s*[A-Z][A-Za-z]*/g, ', $1');

  // ── Remove `payload: RegisterCredentials` style destructure in arrow fns ──
  code = code.replace(/\(payload\s*:\s*\w+\)/g, '(payload)');
  code = code.replace(/\(data\s*:\s*Partial<[^>]+>\)/g, '(data)');
  code = code.replace(/\(form\s*:\s*\w+\)/g, '(form)');

  // ── Remove remaining `: void`, `: string`, `: boolean`, `: number` in params ──
  const primitives = ['string', 'number', 'boolean', 'void', 'null', 'undefined', 'never', 'any', 'unknown'];
  for (const p of primitives) {
    code = code.replace(new RegExp(`\\b(\\w+)\\s*:\\s*${p}(?=[,\\)\\}\\s=;])`, 'g'), '$1');
  }

  // ── Remove `onMove: (task, status) => void` style prop type annotations ──
  code = code.replace(/(\w+)\s*:\s*\([^)]*\)\s*=>\s*void\s*;/g, '$1: undefined;');

  // ── Clean up empty import lines ──
  code = code.replace(/^import\s*\{\s*\}\s*from\s*['"][^'"]*['"];?\s*$/gm, '');
  code = code.replace(/^export\s+type\s+\{[^}]*\};?\s*$/gm, '');

  // ── Remove stray `as VariantProps<typeof x>["variant"]` casts ──
  code = code.replace(/\s+as\s+VariantProps<[^>]+>\["[^"]+"\]/g, '');

  // ── Remove TypeScript `declare module` and `declare global` blocks ──
  code = code.replace(/declare\s+module\s+["'][^"']*["']\s*\{[\s\S]*?\n\}/gm, '');
  code = code.replace(/declare\s+global\s*\{[\s\S]*?\n\}/gm, '');

  // ── Remove `!` non-null assertions ──
  code = code.replace(/(\w+|\)|\])\!(?=[\.\[\(,;\)\}\s])/g, '$1');

  // ── Remove `?` optional chaining that originated from TS non-null (keep real ones) ──
  // Actually keep ?. — it's valid JS optional chaining

  // ── Remove leftover `?: ` in object type literals used as annotations ──
  code = code.replace(/\w+\?:\s*[A-Za-z<>\[\]|&,\s]+;/g, '');

  // ── Clean up multiple blank lines ──
  code = code.replace(/\n{3,}/g, '\n\n');

  return code;
}

const files = getAllJSX(srcDir);
let changed = 0;
for (const f of files) {
  const before = fs.readFileSync(f, 'utf8');
  const after = clean(before);
  if (after !== before) {
    fs.writeFileSync(f, after, 'utf8');
    console.log(`✓ Cleaned: ${path.relative(srcDir, f)}`);
    changed++;
  }
}
console.log(`\n✅ Cleaned ${changed} files.`);
