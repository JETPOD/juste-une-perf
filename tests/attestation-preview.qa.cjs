const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const path = require('node:path');
const { test } = require('node:test');
const { chromium } = require('playwright');

test('closing the native preview after two seconds clears the original DOM', { timeout: 30000 }, async (t) => {
  const browser = await chromium.launch({ headless: false });
  t.after(() => browser.close());
  const page = await browser.newPage();
  const captures = [];
  const dismissals = [];
  await page.exposeFunction('beforeAttestationPrint', name => captures.push(name));
  await page.exposeFunction('afterAttestationPrint', () => dismissals.push(true));
  await page.route('https://attestation.test/', route =>
    route.fulfill({ contentType: 'text/html', body: '<!doctype html><title>Test attestations</title><p>Jeu de test</p>' }));
  await page.goto('https://attestation.test/');
  await page.addScriptTag({ path: path.join(__dirname, '..', 'attestation.js') });
  await page.evaluate(() => {
    window.addEventListener('beforeprint', () =>
      window.beforeAttestationPrint(document.querySelector('#sga-print .sga-name')?.textContent));
    window.addEventListener('afterprint', () => window.afterAttestationPrint());
    SGAttestation.open({ jeu: 'Jeu de test', ratio: 0.95 });
  });
  await page.locator('#sga-name').fill('Camille Dupont');
  await page.locator('.sga-ok').click();
  for (let attempt = 0; attempt < 100 && !captures.length; attempt++) {
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  assert.equal(captures[0], 'Camille Dupont');
  await new Promise(resolve => setTimeout(resolve, 2200));
  assert.equal(dismissals.length, 0, 'preview should remain open before Escape');
  execFileSync('xdotool', ['key', 'Escape']);
  await page.waitForFunction(() =>
    !document.querySelector('#sga-print, .sga-dlg') &&
    !document.documentElement.classList.contains('sga-printing'), null, { timeout: 10000 });
  assert.equal(dismissals.length, 1);
  assert.doesNotMatch(await page.content(), /Camille Dupont/);
});
