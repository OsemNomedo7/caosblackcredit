/**
 * sync-assets.js
 * Copia imagens de /public/imagens → /frontend/public/imagens
 * Execute com: node sync-assets.js
 */
const fs   = require('fs');
const path = require('path');

const SRC  = path.join(__dirname, 'public', 'imagens');
const DEST = path.join(__dirname, 'frontend', 'public', 'imagens');

fs.mkdirSync(DEST, { recursive: true });

const files = fs.readdirSync(SRC);
let count = 0;
files.forEach(f => {
  const src  = path.join(SRC, f);
  const dest = path.join(DEST, f);
  if (fs.statSync(src).isFile()) {
    fs.copyFileSync(src, dest);
    console.log(`  ✓ ${f}`);
    count++;
  }
});
console.log(`\nSincronizados: ${count} arquivo(s) → frontend/public/imagens/\n`);
