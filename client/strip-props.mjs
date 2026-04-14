// strip-react-component-props.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.join(__dirname, 'src');

function getAllJSX(dir) {
  const res = [];
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, f.name);
    if (f.isDirectory()) res.push(...getAllJSX(full));
    else if (f.name.endsWith('.jsx') || f.name.endsWith('.js')) res.push(full);
  }
  return res;
}

let count = 0;

for (const file of getAllJSX(srcDir)) {
  let code = fs.readFileSync(file, 'utf8');
  const before = code;

  // ── Pattern: `}: React.ComponentProps<"div"> & { extraProp }) {`
  //   → `}) {`
  code = code.replace(/\}\s*:\s*React\.ComponentProps<[^>]+>\s*&\s*\{[^}]*\}\s*\)\s*\{/g, '}) {');

  // ── Pattern: `}: React.ComponentProps<"div">) {`  → `}) {`
  code = code.replace(/\}\s*:\s*React\.ComponentProps<[^>]+>\s*\)\s*\{/g, '}) {');

  // ── Pattern: `& CarouselProps) {` leftover → `) {`
  code = code.replace(/\s*&\s*[A-Z]\w+Props\s*\)\s*\{/g, ') {');

  // ── Pattern `({ className, ...props }: React.ComponentProps<"div">)` → `({ className, ...props })`
  code = code.replace(/\((\{[^}]+\})\s*:\s*React\.ComponentProps<[^>]+>\s*\)/g, '($1)');

  // ── Remaining standalone `: React.ComponentProps<...>` annotations
  code = code.replace(/:\s*React\.ComponentProps<[^>]+>\[\"[^\"]+\"\]/g, '');
  code = code.replace(/:\s*React\.ComponentProps<[^>]+>/g, '');

  // ── Remove optional prop type lines inside function bodies from TS: `  showIcon?;`
  code = code.replace(/^\s{2,}\w+\?;\s*$/gm, '');

  // ── `buttonVariant?: ...;` extra prop type declarations lines
  code = code.replace(/^\s{2,}\w+\??:\s*.+;\s*$/gm, (line) => {
    // Only remove if it looks like a standalone type annotation (no = sign)
    if (line.includes('=') || line.includes('=>') || line.includes('//')) return line;
    return '';
  });

  // ── `children: React.ComponentProps<...>` in object types  
  code = code.replace(/children:\s*React\.ComponentProps<[^>]+>/g, 'children');

  // ── `labelKey } : React.ComponentProps<...>` remnants (chart.jsx)
  code = code.replace(/(\w+)\s*\}\s*:\s*React\.ComponentProps<[^>]+>\s*&?\s*/g, '$1 } ');

  // ── Remove `& { asChild?; }` union types remaining in params
  code = code.replace(/\s*&\s*\{\s*\w+\?(?::\s*[^;]+)?;\s*(?:\w+\?(?::\s*[^;]+)?;\s*)*\}/g, '');

  // ── Clean multiple blank lines
  code = code.replace(/\n{3,}/g, '\n\n');

  if (code !== before) {
    fs.writeFileSync(file, code, 'utf8');
    console.log(`✓ ${path.relative(srcDir, file)}`);
    count++;
  }
}

console.log(`\n✅ Stripped React.ComponentProps from ${count} files.`);
