const assert = require('node:assert/strict');
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist']
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const runtimeErrors = [];
  const consoleErrors = [];
  const failedRequests = [];
  page.on('pageerror', (error) => runtimeErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('requestfailed', (request) => failedRequests.push(request.url() + ' :: ' + (request.failure()?.errorText || 'failed')));

  try {
    await page.goto('http://127.0.0.1:4173/', { waitUntil: 'domcontentloaded', timeout: 60000 });
    const loadState = await page.waitForFunction(() => {
      const loading = document.getElementById('loading-screen');
      const status = document.getElementById('loading-status');
      if (loading && loading.classList.contains('done')) return 'ready';
      if (status && status.textContent.includes('COULD NOT LOAD')) return 'failed';
      return null;
    }, null, { timeout: 45000 }).catch(() => 'timeout');

    if (loadState !== 'ready') {
      const diagnostics = await page.evaluate(() => ({
        loadingClass: document.getElementById('loading-screen')?.className,
        loadingStatus: document.getElementById('loading-status')?.textContent,
        errorText: document.querySelector('#loading-screen small[style]')?.textContent,
        sdkLoaded: !!(window.CrazyGames && window.CrazyGames.SDK),
        sdkEnvironment: window.CrazyGames?.SDK?.environment || null
      }));
      console.error('Browser startup diagnostics:', JSON.stringify({ loadState, diagnostics, runtimeErrors, consoleErrors, failedRequests }, null, 2));
      throw new Error('Game startup did not complete: ' + loadState);
    }

    assert.equal(await page.locator('#menu-screen').isVisible(), true, 'main menu should be visible');
    assert.equal(await page.locator('.mode-card').count(), 4, 'all four mode cards should exist');

    await page.locator('#how-button').click();
    assert.equal(await page.locator('#modal-overlay').isVisible(), true, 'how-to modal should open');
    await page.locator('#modal-close').click();

    const scenarios = [
      { mode: 'rush', map: 'neon' },
      { mode: 'team', map: 'tropical' },
      { mode: 'survival', map: 'factory' },
      { mode: 'gold', map: 'skyfall' }
    ];

    for (const scenario of scenarios) {
      await page.locator('.mode-card[data-mode="' + scenario.mode + '"]').click();
      await page.locator('#map-select').selectOption(scenario.map);
      await page.locator('#play-button').click();
      await page.waitForFunction(() => {
        const hud = document.getElementById('game-hud');
        return hud && !hud.classList.contains('hidden');
      }, { timeout: 10000 });
      assert.match(await page.locator('#hud-timer').textContent(), /^\d{2}:\d{2}$/, scenario.mode + ' timer should render');
      await page.waitForTimeout(250);

      if (scenario.mode === 'team') {
        await page.locator('#settings-button').click();
        assert.equal(await page.locator('#modal-overlay').isVisible(), true, 'settings should open during a match');
        assert.equal(await page.locator('#pause-overlay').isVisible(), true, 'opening settings should pause active gameplay');
        await page.locator('#modal-close').click();
        assert.equal(await page.locator('#pause-overlay').isVisible(), false, 'closing settings should resume gameplay');
      }

      await page.keyboard.press('Escape');
      await page.waitForFunction(() => {
        const pause = document.getElementById('pause-overlay');
        return pause && !pause.classList.contains('hidden');
      }, { timeout: 5000 });
      await page.locator('#resume-button').click();
      await page.waitForFunction(() => document.getElementById('pause-overlay').classList.contains('hidden'), { timeout: 5000 });

      await page.locator('#pause-button').click();
      await page.locator('#leave-button').click();
      await page.waitForFunction(() => !document.getElementById('menu-screen').classList.contains('hidden'), { timeout: 5000 });
    }

    assert.deepEqual(runtimeErrors, [], 'browser runtime should not throw page errors');
    console.log('BROWSER SMOKE CHECK PASSED: all 4 modes, all 4 maps, menus, pause/resume and settings');
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});