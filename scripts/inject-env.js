/**
 * Reads .env and writes environment.generated.ts with NX_TMDB_API_KEY.
 * Run before serve/build so the app gets the key without committing it.
 */
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const envPath = path.join(rootDir, '.env');

if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  const lines = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('#')) continue;
    const match = trimmed.match(/^NX_TMDB_API_KEY\s*=\s*(.*)$/);
    if (match) {
      const value = match[1].trim().replace(/^["']|["']$/g, '').split(/\s*#/)[0].trim();
      process.env.NX_TMDB_API_KEY = value;
      break;
    }
  }
}

const key = (process.env.NX_TMDB_API_KEY || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
const outPath = path.join(rootDir, 'apps', 'admin-shell', 'src', 'environments', 'environment.generated.ts');
const outDir = path.dirname(outPath);
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

fs.writeFileSync(
  outPath,
  `/** Auto-generated from .env - do not commit if it contains a real key. */\nexport const env = {\n  NX_TMDB_API_KEY: '${key}',\n};\n`,
  'utf8'
);

if (key) {
  console.log('TMDB API key injected from .env');
} else {
  console.log('No NX_TMDB_API_KEY in .env - TMDB requests will fail until you add it');
}
