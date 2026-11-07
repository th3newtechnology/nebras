import * as fs from 'fs';

const filePath = process.argv[2] || './lighthouse-report.json';
const raw = fs.readFileSync(filePath, 'utf-8');
const r = JSON.parse(raw);

console.log(`=== LIGHTHOUSE CATEGORIES (${filePath}) ===`);
for (const [k, v] of Object.entries(r.categories)) {
  console.log(`${k}: ${Math.round((v as any).score * 100)}%`);
}

console.log('\n=== CORE WEB VITALS ===');
console.log('LCP:', r.audits['largest-contentful-paint']?.displayValue, `(${r.audits['largest-contentful-paint']?.numericValue} ms)`);
console.log('CLS:', r.audits['cumulative-layout-shift']?.displayValue);
console.log('FCP:', r.audits['first-contentful-paint']?.displayValue, `(${r.audits['first-contentful-paint']?.numericValue} ms)`);
console.log('TBT:', r.audits['total-blocking-time']?.displayValue);
console.log('Speed Index:', r.audits['speed-index']?.displayValue);

console.log('\n=== NOTABLE AUDITS ===');
for (const [id, a] of Object.entries(r.audits) as any[]) {
  if (a.score !== null && a.score < 1 && a.score !== undefined) {
    console.log(`[${id}] score: ${a.score} | ${a.title} -> ${a.displayValue || ''}`);
  }
}
