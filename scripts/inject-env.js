/**
 * Reads .env and writes environment.generated.ts with NX_TMDB_API_KEY.
 * Run before serve/build so the app gets the key without committing it.
 */
const fs = require('fs');
const path = require('path');

// Simple .env parser (no dotenv dependency required)
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach((line) => {
    const match = line.match(/^\s*NX_TMDB_API_KEY\s*=\s*(.*)$/);
    if (match) {
      const value = match[1].trim().replace(/^["']|["']$/g, '');
      process.env.NX_TMDB_API_KEY = value;
    }
  });
}

const key = (process.env.NX_TMDB_API_KEY || '').replace(/'/g, "\\'");
const outPath = path.join(
  __dirname,
  '..',
  'apps',
  'admin-shell',
  'src',
  'environments',
  'environment.generated.ts'
);
const outDir = path.dirname(outPath);
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

fs.writeFileSync(
  outPath,
  `/** Auto-generated from .env - do not commit if it contains a real key. */\nexport const env = {\n  NX_TMDB_API_KEY: '${key}',\n};\n`,
  'utf8'
);
