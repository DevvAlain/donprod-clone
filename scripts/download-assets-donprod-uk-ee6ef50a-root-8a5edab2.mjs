import { createWriteStream, mkdirSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

function ensureDir(p) {
  if (!existsSync(p)) mkdirSync(p, { recursive: true });
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    if (existsSync(dest)) { console.log('  skip (exists):', dest); return resolve(); }
    ensureDir(dirname(dest));
    const proto = url.startsWith('https') ? https : http;
    proto.get(url, res => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        console.error('  FAIL', res.statusCode, url);
        res.resume();
        return resolve();
      }
      const file = createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => { file.close(); console.log('  ok:', dest.replace(ROOT, '')); resolve(); });
      file.on('error', reject);
    }).on('error', err => { console.error('  ERR', url, err.message); resolve(); });
  });
}

async function batch(tasks, concurrency = 4) {
  const queue = [...tasks];
  const workers = Array(concurrency).fill(null).map(async () => {
    while (queue.length) {
      const task = queue.shift();
      if (task) await task();
    }
  });
  await Promise.all(workers);
}

const BASE = 'https://www.donprod.uk';
const SITE_KEY = 'donprod-uk-ee6ef50a';
const PAGE_KEY = 'root-8a5edab2';
const ASSETS = join(ROOT, 'public', 'sites', SITE_KEY, PAGE_KEY);
const SHARED = join(ROOT, 'public', 'sites', SITE_KEY, 'shared');
const FONTS = join(ROOT, 'public', 'fonts', SITE_KEY);

const PROJECTS = [
  'ICEMAN','VILLAINS','AURA4AURA','NOCOMMENT','TRILOGY','PILATES','CENTURY','BIRTHDAY',
  'SON','BELLINGHAM','8PM','GEEKIN','COLD','HOOLIGAN','MALEVIOLENCE','NOINTRO',
  'PACKYSHIVA','SOMBRERO','TIMEFLIES','TWOTONE','VALLIANT','VEIGH','MOI','TIPSY',
  'IKNOW','LS','ITSUS','PTSD','EVICTED'
];

const tasks = [
  // Custom fonts
  () => download(`${BASE}/static/media/sporty-pro-black.86d44592dcde43dfa8b2.woff2`, join(FONTS, 'sporty-pro-black.woff2')),
  () => download(`${BASE}/static/media/HeadingNow36Bold.36955ce191ada9bfacc1.woff2`, join(FONTS, 'HeadingNow36Bold.woff2')),
  () => download(`${BASE}/static/media/HeadingNow37ExtraBold.5c9ad2b8607353c2e076.woff2`, join(FONTS, 'HeadingNow37ExtraBold.woff2')),
  () => download(`${BASE}/static/media/HeadingNow46Bold.2b0dd893f777676b4ad6.woff2`, join(FONTS, 'HeadingNow46Bold.woff2')),
  () => download(`${BASE}/static/media/HeadingNow47ExtraBold.7ff759230e5a10692ddd.woff2`, join(FONTS, 'HeadingNow47ExtraBold.woff2')),
  // Noise texture
  () => download(`${BASE}/static/media/noise.253aafe38873e0bb90a2.webp`, join(SHARED, 'noise.webp')),
  // Branding
  () => download(`${BASE}/media/branding/logo-upper.png`, join(ASSETS, 'images', 'logo-upper.png')),
  () => download(`${BASE}/media/branding/logo-lower.png`, join(ASSETS, 'images', 'logo-lower.png')),
  // Favicon
  () => download(`${BASE}/favicon.ico`, join(ROOT, 'public', 'favicon.ico')),
  () => download(`${BASE}/logo192.png`, join(ROOT, 'public', 'logo192.png')),
  // Project thumbnails
  ...PROJECTS.flatMap(slug => [
    () => download(`${BASE}/media/main/${slug}/thumbnails/mobile.webp`, join(ASSETS, 'images', slug.toLowerCase(), 'mobile.webp')),
    () => download(`${BASE}/media/main/${slug}/thumbnails/desktop.webp`, join(ASSETS, 'images', slug.toLowerCase(), 'desktop.webp')),
    () => download(`${BASE}/media/main/${slug}/thumbnails/placeholder.webp`, join(ASSETS, 'images', slug.toLowerCase(), 'placeholder.webp')),
  ]),
];

console.log(`Downloading ${tasks.length} assets...`);
await batch(tasks, 4);
console.log('Done.');
