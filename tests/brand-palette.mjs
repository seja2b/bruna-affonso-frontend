import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../src/', import.meta.url));
const extensions = new Set(['.css', '.js', '.jsx', '.ts', '.tsx']);
const files = [];

function collect(directory) {
  for (const name of readdirSync(directory)) {
    const path = join(directory, name);
    if (statSync(path).isDirectory()) collect(path);
    else if (extensions.has(extname(path))) files.push(path);
  }
}

collect(root);
const source = files.map((file) => readFileSync(file, 'utf8')).join('\n').toLowerCase();

for (const color of ['#01041a', '#01155c', '#011663', '#0132c8']) {
  assert.ok(source.includes(color), `cor oficial ausente: ${color}`);
}

for (const legacy of ['#7c3aed', '#8b5cf6', '#4f46e5', '#6366f1', '#6d28d9', '#ec4899', '#e91e63']) {
  assert.ok(!source.includes(legacy), `cor antiga ainda presente: ${legacy}`);
}

console.log('PASS: paleta oficial aplicada sem cores roxas e rosas antigas');
