import * as fs from 'fs';

const raw = fs.readFileSync('./lighthouse-desktop-report.json', 'utf-8');
const r = JSON.parse(raw);

console.log('--- COLOR CONTRAST ITEMS ---');
const cc = r.audits['color-contrast']?.details?.items || [];
for (const item of cc) {
  console.log('Element:', item.node?.snippet, '| Selector:', item.node?.selector, '| Contrast:', item.contrastRatio);
}

console.log('\n--- LABEL CONTENT NAME MISMATCH ---');
const mm = r.audits['label-content-name-mismatch']?.details?.items || [];
for (const item of mm) {
  console.log('Element:', item.node?.snippet, '| Selector:', item.node?.selector);
}
