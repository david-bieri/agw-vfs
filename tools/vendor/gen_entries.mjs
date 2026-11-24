// Generate one ESM entry per importmap specifier, exporting the package's full
// static name list. Built with esbuild --splitting so every entry shares ONE copy
// of React (ADR-018: two React instances = null hook dispatcher).
// usage: node gen_entries.mjs <vbuild dir>
import { createRequire } from 'node:module';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const dir = process.argv[2];
const req = createRequire(join(dir, 'package.json'));
const out = join(dir, 'entries');
mkdirSync(out, { recursive: true });
const ok = (k) => /^[A-Za-z_$][\w$]*$/.test(k) && k !== 'default' && k !== '__esModule';

// CommonJS packages: esbuild cannot derive static names from `export *`,
// so list them explicitly from the live module.
const cjs = {
  'react': 'react',
  'react-dom': 'react-dom',
  'react-dom-client': 'react-dom/client',
  'react-jsx-runtime': 'react/jsx-runtime',
};
for (const [file, spec] of Object.entries(cjs)) {
  const names = Object.keys(req(spec)).filter(ok).sort();
  writeFileSync(join(out, file + '.js'),
    `import * as M from ${JSON.stringify(spec)};\n` +
    `const m = M.default ?? M;\nexport default m;\n` +
    `export const { ${names.join(', ')} } = m;\n`);
  console.log(file, names.length, 'names');
}
// ESM packages: static re-export is exact. No default export: recharts' ES build
// has none (Node's CJS interop invents one), and d3 has none either.
for (const [file, spec] of [['recharts', 'recharts'], ['d3', 'd3']]) {
  writeFileSync(join(out, file + '.js'), `export * from ${JSON.stringify(spec)};\n`);
  console.log(file, 'export *');
}
