#!/usr/bin/env node
// Validates questions/*.yaml against Kahoot's hard limits before we build.
// Usage: node scripts/validate.mjs questions/2026.yaml
import { readFileSync } from 'node:fs';

const VALID_TIMES = [5000,10000,15000,20000,30000,45000,60000,90000,120000,180000,240000];
const file = process.argv[2] ?? 'questions/2026.yaml';
const src = readFileSync(file, 'utf8');

// Deliberately dumb line-scanner: avoids a YAML dependency for a file only we edit.
const errors = [], warnings = [], cats = {};
let n = 0, choices = 0, hasCorrect = false, qLine = 0, contentSlides = 0;

const flushQuestion = () => {
  if (!n) return;
  if (choices && choices < 2) errors.push(`Q${n} (line ${qLine}): only ${choices} choice(s)`);
  if (choices > 6) errors.push(`Q${n} (line ${qLine}): ${choices} choices, max is 6`);
  if (choices && !hasCorrect) errors.push(`Q${n} (line ${qLine}): no choice marked correct`);
};

src.split('\n').forEach((line, i) => {
  const ln = i + 1;
  if (/^\s*#/.test(line)) return;          // comment line, not data
  if (/^  - (category|type|question):/.test(line)) {
    flushQuestion();
    n++; qLine = ln; choices = 0; hasCorrect = false;
    if (/type: content/.test(line)) contentSlides++;
  }
  let m;
  if ((m = line.match(/^\s+-?\s*category:\s*(\S+)/))) cats[m[1]] = (cats[m[1]] ?? 0) + 1;
  if ((m = line.match(/^\s+question:\s*"(.*)"\s*$/)) && m[1].length > 120)
    errors.push(`line ${ln}: question is ${m[1].length} chars (max 120)`);
  if ((m = line.match(/^\s+-?\s*answer:\s*"(.*)"\s*$/))) {
    choices++;
    if (m[1].length > 75) errors.push(`line ${ln}: answer is ${m[1].length} chars (max 75)`);
  }
  if (/^\s+correct:\s*true/.test(line)) hasCorrect = true;
  if ((m = line.match(/^\s+time:\s*(\d+)/)) && !VALID_TIMES.includes(+m[1]))
    errors.push(`line ${ln}: time ${m[1]}ms is not a legal Kahoot value`);
  if ((m = line.match(/^\s+image_query:\s*"(.*)"\s*$/)) && m[1].length > 100)
    errors.push(`line ${ln}: image_query is ${m[1].length} chars (max 100)`);
  if (/verify:\s*true/.test(line)) warnings.push(`line ${ln}: fact flagged for verification`);
});
flushQuestion();

const scored = n - contentSlides;
console.log(`\n${file}`);
console.log(`  ${n} slides total  (${scored} scored questions + ${contentSlides} content slides)`);
console.log(`  by category:`, cats);
if (scored < 20) console.log(`  ! only ${scored} scored questions - aim for 20-25 to separate 12 players cleanly`);
warnings.forEach(w => console.log(`  ? ${w}`));
if (errors.length) { console.log('\nERRORS:'); errors.forEach(e => console.log(`  x ${e}`)); process.exit(1); }
console.log('\n  valid - safe to build\n');
