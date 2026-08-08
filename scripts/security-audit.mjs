import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const issues = [];
const textFiles = [];
const allowedExternalOrigins = new Set([
  'https://advertise.bingads.microsoft.com',
  'https://app.cowlendar.com',
  'https://api.notify-me.app',
  'https://caringsunshine.com',
  'https://cdn.shopify.com',
  'https://cdn.notify-me.io',
  'https://fonts.googleapis.com',
  'https://fonts.gstatic.com',
  'https://frontiersin.org',
  'https://gsap.com',
  'https://healthtraveljunkie.com',
  'https://herbs-america.com',
  'https://image-ppubs.uspto.gov',
  'https://in.foliuslabs.com',
  'https://inti-drink.com',
  'https://lifeextension.com',
  'https://loox.io',
  'https://ncbi.nlm.nih.gov',
  'https://optout.aboutads.info',
  'https://peacehealth.org',
  'https://phcogj.com',
  'https://pmc.ncbi.nlm.nih.gov',
  'https://pubmed.ncbi.nlm.nih.gov',
  'https://res.cloudinary.com',
  'https://researchgate.net',
  'https://schema.org',
  'https://sciencemeetsfood.org',
  'https://selfhacked.com',
  'https://senchateabar.com',
  'https://static.klaviyo.com',
  'https://theelectriceats.com',
  'https://theherbalacademy.com',
  'https://the-electric-eats.myshopify.com',
  'https://tools.google.com',
  'https://www.facebook.com',
  'https://www.academia.edu',
  'https://www.allaboutcookies.org',
  'https://www.cancerresearchuk.org',
  'https://www.frontiersin.org',
  'https://www.google.com',
  'https://www.healthline.com',
  'https://www.instagram.com',
  'https://www.islandherbsandspices.com',
  'https://www.klaviyo.com',
  'https://www.mdpi.com',
  'https://www.ncbi.nlm.nih.gov',
  'https://www.networkadvertising.org',
  'https://www.rain-tree.com',
  'https://www.researchgate.net',
  'https://www.shopify.com',
  'https://www.tiktok.com',
  'https://www.tuasaude.com',
  'https://www.youtube.com',
  'https://x.com'
]);

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'tmp') continue;
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (/\.(?:html|js|css|json|xml|txt|yml|yaml)$/i.test(entry.name)) textFiles.push(file);
  }
}
walk(root);

const secretShapes = [
  ['GitHub token', /gh[ps]_[A-Za-z0-9]{20,}/],
  ['Shopify private token', /shp(?:at|ca|pa|ss)_[A-Za-z0-9]{20,}/],
  ['AWS access key', /AKIA[0-9A-Z]{16}/],
  ['Stripe private key', /sk_(?:live|test)_[A-Za-z0-9]{20,}/],
  ['private key block', /BEGIN (?:RSA |EC |OPENSSH |PGP )?PRIVATE KEY/]
];

for (const file of textFiles) {
  const rel = path.relative(root, file);
  const text = fs.readFileSync(file, 'utf8');
  for (const [label, pattern] of secretShapes) {
    if (pattern.test(text)) issues.push(`${rel}: ${label} shape found`);
  }
  if (/\b(?:src|href|data-src)=["']http:\/\//i.test(text)) issues.push(`${rel}: insecure HTTP resource`);
  if (rel === 'product-data.js' && /"link"\s*:\s*"http:\/\//i.test(text)) issues.push(`${rel}: insecure HTTP study link`);
  if (/javascript\s*:/i.test(text)) issues.push(`${rel}: javascript URL`);
  if (/\.postMessage\([^;]+,[\s]*["']\*["']\)/s.test(text)) issues.push(`${rel}: wildcard postMessage target origin`);

  for (const match of text.matchAll(/https:\/\/[^\s"'<>`)]+/g)) {
    try {
      const origin = new URL(match[0].replace(/&amp;.*/, '')).origin;
      if (!allowedExternalOrigins.has(origin) && !origin.endsWith('.github.io')) {
        issues.push(`${rel}: unreviewed external origin ${origin}`);
      }
    } catch {}
  }

  if (rel.endsWith('.html')) {
    if (!/<meta\s+name=["']referrer["']\s+content=["']strict-origin-when-cross-origin["']/i.test(text)) {
      issues.push(`${rel}: missing strict referrer policy`);
    }
    for (const anchor of text.matchAll(/<a\b[^>]*target=["']_blank["'][^>]*>/gi)) {
      if (!/rel=["'][^"']*noopener/i.test(anchor[0])) issues.push(`${rel}: target blank without noopener`);
    }
    for (const frame of text.matchAll(/<iframe\b[^>]*(?:src|data-src)=["']https:\/\/[^>]+>/gi)) {
      if (!/referrerpolicy=["']strict-origin-when-cross-origin["']/i.test(frame[0])) {
        issues.push(`${rel}: external iframe without referrerpolicy`);
      }
    }
  }
}

const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
if (!app.includes('navigator.globalPrivacyControl===true')) issues.push('app.js: Global Privacy Control is not honored');
if (!app.includes("'https://www.youtube.com'")) issues.push('app.js: YouTube postMessage origin is not pinned');
const product = fs.readFileSync(path.join(root, 'product.js'), 'utf8');
if (!product.includes("url.protocol === 'https:'")) issues.push('product.js: external study URLs are not restricted to HTTPS');

console.log(JSON.stringify({ filesChecked: textFiles.length, issues }, null, 2));
if (issues.length) process.exitCode = 1;
