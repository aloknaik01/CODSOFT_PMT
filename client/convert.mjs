// convert.mjs - Convert TypeScript to JavaScript, remove Caffeine branding
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.join(__dirname, 'src');

// Files/dirs to DELETE entirely (Caffeine/ICP specific, not used by the frontend)
const DELETE_FILES = [
  'backend.ts',
  'backend.d.ts',
  'declarations',
];

// Files to SKIP converting (already .js or other)
const SKIP_EXTENSIONS = ['.js', '.jsx', '.css', '.json', '.ico', '.png', '.jpg', '.svg', '.md'];

// ─── TypeScript → JavaScript stripping ───────────────────────────────────────

function stripTypeScript(code, isJSX) {
  // Remove /// <reference ... /> lines
  code = code.replace(/^\/\/\/\s*<reference[^>]*\/>\s*$/gm, '');
  
  // Remove @ts-nocheck, @ts-ignore comments
  code = code.replace(/^\/\/\s*@ts-(nocheck|ignore|expect-error).*$/gm, '');

  // Remove `import type { ... } from "..."` statements entirely
  code = code.replace(/^import\s+type\s+\{[^}]*\}\s+from\s+["'][^"']*["'];?\s*$/gm, '');
  
  // Remove `import type Something from "..."` statements
  code = code.replace(/^import\s+type\s+\S+\s+from\s+["'][^"']*["'];?\s*$/gm, '');

  // Convert `import { type Foo, Bar }` → `import { Bar }` 
  // (remove `type` keyword from named imports)
  code = code.replace(/import\s*\{([^}]+)\}\s*from/g, (match, imports) => {
    const cleaned = imports
      .split(',')
      .map(i => i.trim())
      .filter(i => {
        // Remove entries that start with "type "
        return !i.startsWith('type ');
      })
      .join(', ');
    if (!cleaned.trim()) return '// removed type-only import';
    return `import { ${cleaned} } from`;
  });

  // Remove TypeScript type annotations in function parameters: `: TypeName`
  // Be careful with JSX attributes and object literals
  // Strategy: use regex for common patterns

  // Remove `as TypeName` casts (simple cases)
  code = code.replace(/\s+as\s+[A-Z][A-Za-z<>\[\]|&,\s.]+(?=[,)\}\];\s])/g, '');

  // Remove generic type parameters from function calls: func<Type>(
  // Only remove when uppercase starts
  code = code.replace(/\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*<([A-Z][^>]*)>\s*\(/g, (match, fn, types) => {
    // Keep JSX-looking things that might be components
    if (types.includes('(') || types.includes('{')) return match;
    return `${fn}(`;
  });

  // Remove interface declarations
  code = code.replace(/^(?:export\s+)?interface\s+\w+[^{]*\{[^}]*\}\s*$/gm, '');
  
  // Remove multi-line interface declarations
  code = code.replace(/^(?:export\s+)?interface\s+[\s\S]*?^\}\s*$/gm, (match) => {
    // Only remove if it looks like a standalone interface (not a JSX object)
    const lines = match.split('\n');
    if (lines[0] && lines[0].match(/^\s*(?:export\s+)?interface\s+/)) {
      return '';
    }
    return match;
  });

  // Remove type declarations: `type Foo = ...`
  code = code.replace(/^(?:export\s+)?type\s+\w+\s*=\s*.+;?\s*$/gm, '');
  
  // Remove multi-line type declarations
  code = code.replace(/^(?:export\s+)?type\s+\w+\s*=\s*[\s\S]*?;\s*$/gm, '');

  // Remove `declare module "..."` blocks
  code = code.replace(/^declare\s+module\s+["'][^"']*["']\s*\{[\s\S]*?^\}\s*$/gm, '');
  
  // Remove `declare global { ... }` blocks
  code = code.replace(/^declare\s+global\s*\{[\s\S]*?^\}\s*$/gm, '');

  // Remove type annotations from variable declarations and parameters
  // Pattern: `: SomeType` before `=`, `,`, `)`, `{`, `;`
  // Remove simple type annotations like `: string`, `: number`, `: boolean`, `: void`, `: null`, `: undefined`, `: never`, `: any`, `: unknown`
  const primitiveTypes = ['string', 'number', 'boolean', 'void', 'null', 'undefined', 'never', 'any', 'unknown', 'object'];
  for (const t of primitiveTypes) {
    code = code.replace(new RegExp(`:\\s*${t}(?=[,\\)\\}\\];=\\s]|$)`, 'gm'), '');
    code = code.replace(new RegExp(`:\\s*${t}\\[\\](?=[,\\)\\}\\];=\\s]|$)`, 'gm'), '');
    code = code.replace(new RegExp(`:\\s*${t}\\s*\\|\\s*null(?=[,\\)\\}\\];=\\s]|$)`, 'gm'), '');
    code = code.replace(new RegExp(`:\\s*${t}\\s*\\|\\s*undefined(?=[,\\)\\}\\];=\\s]|$)`, 'gm'), '');
  }

  // Remove return type annotations: `): ReturnType {` or `): ReturnType;`
  code = code.replace(/\):\s*[A-Z][A-Za-z<>\[\]|&,\s.]*(?=\s*[{;])/g, ')');
  code = code.replace(/\):\s*[a-z][A-Za-z<>\[\]|&,\s.]*(?=\s*[{;])/g, ')');

  // Remove generics from useState, useRef, etc.
  code = code.replace(/\b(useState|useRef|useContext|createContext|createRef|forwardRef|useReducer|useMemo|useCallback)\s*<[^>]*>/g, '$1');

  // Remove React.FC, React.ReactNode, React.ReactElement type annotations
  code = code.replace(/:\s*React\.[A-Za-z<>\[\]|&,\s.]+(?=[,\)=\}\];])/g, '');

  // Remove `: React.CSSProperties`
  code = code.replace(/:\s*React\.CSSProperties/g, '');

  // Remove function return type: `function foo(...): ReturnType`
  code = code.replace(/(function\s+\w+\s*\([^)]*\))\s*:\s*[A-Za-z<>\[\]|&,\s.]+(?=\s*\{)/g, '$1');

  // Clean up `// removed type-only import` if imports are empty or the line is empty  
  code = code.replace(/^\/\/ removed type-only import\s*$/gm, '');

  // Remove empty import statements that result from cleaning
  code = code.replace(/^import\s*\{\s*\}\s*from\s*["'][^"']*["'];?\s*$/gm, '');
  
  // Remove `export type { ... }` statements
  code = code.replace(/^export\s+type\s+\{[^}]*\};?\s*$/gm, '');

  // Clean up multiple consecutive blank lines
  code = code.replace(/\n{3,}/g, '\n\n');

  return code;
}

// ─── File operations ──────────────────────────────────────────────────────────

function getAllFiles(dir) {
  const result = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) {
      result.push(...getAllFiles(full));
    } else {
      result.push(full);
    }
  }
  return result;
}

function convertFile(filePath) {
  const ext = path.extname(filePath);
  const base = path.basename(filePath, ext);
  const dir = path.dirname(filePath);

  if (SKIP_EXTENSIONS.includes(ext)) return;
  if (ext !== '.ts' && ext !== '.tsx') return;

  const isJSX = ext === '.tsx';
  const newExt = isJSX ? '.jsx' : '.js';
  const newPath = path.join(dir, base + newExt);

  let code = fs.readFileSync(filePath, 'utf8');
  code = stripTypeScript(code, isJSX);

  fs.writeFileSync(newPath, code, 'utf8');
  fs.unlinkSync(filePath);
  
  console.log(`✓ ${path.relative(srcDir, filePath)} → ${base}${newExt}`);
}

// ─── Delete Caffeine/ICP files ────────────────────────────────────────────────

function deleteItems(items, baseDir) {
  for (const item of items) {
    const full = path.join(baseDir, item);
    if (!fs.existsSync(full)) continue;
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      fs.rmSync(full, { recursive: true, force: true });
      console.log(`🗑  Deleted directory: ${item}`);
    } else {
      fs.unlinkSync(full);
      console.log(`🗑  Deleted file: ${item}`);
    }
  }
}

// ─── Fix Caffeine branding in HTML and other files ───────────────────────────

function fixBranding(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  const before = content;
  
  content = content.replace(/Built with caffeine\.ai/gi, 'TaskFlow — Manage Projects Like a Pro');
  content = content.replace(/caffeine\.ai/gi, 'taskflow.app');
  content = content.replace(/@caffeine\//g, '@taskflow/');
  content = content.replace(/@caffeineai\//g, '@taskflow/');
  content = content.replace(/caffeinelabs/gi, 'taskflow');
  content = content.replace(/caffeine/gi, 'taskflow');
  
  if (content !== before) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✎  Fixed branding: ${path.basename(filePath)}`);
  }
}

// ─── Fix main.jsx after conversion (remove InternetIdentityProvider) ──────────

function fixMainFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  let code = fs.readFileSync(filePath, 'utf8');
  
  // Remove @caffeineai/core-infrastructure import
  code = code.replace(/^import\s+.*?@caffeineai[^;]*;?\s*$/gm, '');
  code = code.replace(/^import\s+.*?@icp-sdk[^;]*;?\s*$/gm, '');
  code = code.replace(/^import\s+.*?@dfinity[^;]*;?\s*$/gm, '');
  
  // Remove InternetIdentityProvider wrapper
  code = code.replace(/<InternetIdentityProvider>\s*/g, '');
  code = code.replace(/\s*<\/InternetIdentityProvider>/g, '');
  
  // Remove BigInt.prototype.toJSON (not needed without ICP)
  code = code.replace(/BigInt\.prototype\.toJSON[\s\S]*?;/g, '');
  
  // Clean up extra blank lines
  code = code.replace(/\n{3,}/g, '\n\n');
  
  fs.writeFileSync(filePath, code, 'utf8');
  console.log(`✎  Fixed main.jsx`);
}

// ─── Fix package.json ─────────────────────────────────────────────────────────

function fixPackageJson(filePath) {
  if (!fs.existsSync(filePath)) return;
  const pkg = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  // Fix name
  pkg.name = 'taskflow-frontend';
  
  // Remove unnecessary dependencies
  const removeDeps = [
    '@caffeineai/core-infrastructure',
    '@dfinity/agent',
    '@dfinity/identity',
    '@dfinity/auth-client',
    '@dfinity/candid',
    '@dfinity/principal',
    '@icp-sdk/core',
    '@react-three/cannon',
    '@react-three/drei',
    '@react-three/fiber',
    'three',
    '@types/three',
    'react-quill-new',
  ];
  
  for (const dep of removeDeps) {
    delete pkg.dependencies?.[dep];
    delete pkg.devDependencies?.[dep];
  }
  
  // Remove typecheck script (no longer needed)
  delete pkg.scripts?.typecheck;
  
  // Remove typescript devDep
  delete pkg.devDependencies?.typescript;
  delete pkg.devDependencies?.['@types/node'];
  delete pkg.devDependencies?.['@types/react'];
  delete pkg.devDependencies?.['@types/react-dom'];
  
  fs.writeFileSync(filePath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
  console.log(`✎  Fixed package.json`);
}

// ─── Fix vite.config.js ───────────────────────────────────────────────────────

function fixViteConfig(filePath) {
  if (!fs.existsSync(filePath)) return;
  let code = fs.readFileSync(filePath, 'utf8');
  
  // Remove vite-plugin-environment import (used for ICP env vars)
  code = code.replace(/^import\s+.*?vite-plugin-environment[^;]*;?\s*$/gm, '');
  code = code.replace(/\s*environment\([^)]*\),?/g, '');
  
  fs.writeFileSync(filePath, code, 'utf8');
  console.log(`✎  Fixed vite.config.js`);
}

// ─── Fix tsconfig / remove it ────────────────────────────────────────────────

function removeTsConfig(dir) {
  const tsconfig = path.join(dir, 'tsconfig.json');
  if (fs.existsSync(tsconfig)) {
    fs.unlinkSync(tsconfig);
    console.log(`🗑  Deleted tsconfig.json`);
  }
  
  const caffeine = path.join(dir, 'caffeine.toml');
  if (fs.existsSync(caffeine)) {
    fs.unlinkSync(caffeine);
    console.log(`🗑  Deleted caffeine.toml`);
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const frontendDir = __dirname;

console.log('\n=== Step 1: Delete ICP/Caffeine-specific files ===\n');
deleteItems(DELETE_FILES, srcDir);

console.log('\n=== Step 2: Convert all .ts/.tsx to .js/.jsx ===\n');
const files = getAllFiles(srcDir);
for (const f of files) {
  convertFile(f);
}

console.log('\n=== Step 3: Fix main.jsx ===\n');
fixMainFile(path.join(srcDir, 'main.jsx'));

console.log('\n=== Step 4: Fix branding in HTML ===\n');
fixBranding(path.join(frontendDir, 'index.html'));

console.log('\n=== Step 5: Fix package.json ===\n');
fixPackageJson(path.join(frontendDir, 'package.json'));

console.log('\n=== Step 6: Fix vite.config.js ===\n');
fixViteConfig(path.join(frontendDir, 'vite.config.js'));

console.log('\n=== Step 7: Remove tsconfig.json & caffeine.toml ===\n');
removeTsConfig(frontendDir);

console.log('\n✅ Done! All TypeScript converted to JavaScript, Caffeine branding removed.\n');
