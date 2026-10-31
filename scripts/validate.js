import fs from 'node:fs';
import assert from 'node:assert/strict';

const html = fs.readFileSync('index.html', 'utf8');
const game = fs.readFileSync('src/game.js', 'utf8');
const sdk = fs.readFileSync('src/crazygames.js', 'utf8');
const css = fs.readFileSync('src/style.css', 'utf8');

const failures = [];
const dynamicModalIds = new Set(['quality', 'volume', 'sensitivity', 'invert', 'save-settings']);

for (const match of game.matchAll(/\$\('([^']+)'\)/g)) {
  const id = match[1];
  if (dynamicModalIds.has(id)) continue;
  if (!html.includes('id="' + id + '"')) failures.push('Missing HTML id: ' + id);
}

const modes = [...html.matchAll(/data-mode="([^"]+)"/g)].map((match) => match[1]);
for (const mode of ['rush', 'team', 'survival', 'gold']) {
  if (!modes.includes(mode)) failures.push('Missing menu mode selector: ' + mode);
  if (!game.includes("'" + mode + "'")) failures.push('Mode is not referenced by game rules: ' + mode);
}

const mapValues = [...html.matchAll(/<option value="([^"]+)">/g)].map((match) => match[1]);
for (const map of ['neon', 'tropical', 'factory', 'skyfall']) {
  if (!mapValues.includes(map)) failures.push('Missing map selector: ' + map);
  if (!game.includes(map + ': {')) failures.push('Map config not found: ' + map);
}

for (const marker of [
  'gameplayStart', 'gameplayStop', 'loadingStart', 'loadingStop',
  "requestAd('rewarded'", 'sdk.data.getItem', 'sdk.data.setItem'
]) {
  if (!sdk.includes(marker)) failures.push('CrazyGames SDK integration missing: ' + marker);
}

if (!html.includes('https://sdk.crazygames.com/crazygames-sdk-v3.js')) failures.push('CrazyGames v3 script is missing from index.html');
if (!html.includes('./src/crazygames.js') || !html.includes('./src/game.js')) failures.push('Game script loading order is incomplete');
if (!css.includes('.touch-ui') || !css.includes('.mode-card.selected')) failures.push('Responsive controls or selected mode styling is missing');

if (failures.length) {
  console.error('PARCEL PANIC SMOKE CHECK FAILED');
  failures.forEach((failure) => console.error(' - ' + failure));
  process.exit(1);
}

console.log('PARCEL PANIC SMOKE CHECK PASSED');
console.log('4 modes · 4 maps · HTML/JS id wiring · CrazyGames SDK hooks · responsive controls');
