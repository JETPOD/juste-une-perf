// Requires Playwright, Chromium and Poppler (pdftotext and pdfinfo).
// Run with: node --test tests/attestation-print.chromium.cjs
// Set CHROMIUM_PATH to use a system Chromium instead of Playwright’s.
// With ATTESTATION_BASELINE set to the old script path, also compare pagination and text.
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const path = require('node:path');
const { test } = require('node:test');
const { chromium } = require('playwright');

const script = path.join(__dirname, '..', 'attestation.js');
const firstName = 'Camille Dupont';
const secondName = 'Morgan Martin';

async function fixture(t, scriptPath = script) {
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || undefined,
  });
  t.after(() => browser.close());
  const page = await browser.newPage();
  await page.route('https://attestation.test/', (route) =>
    route.fulfill({ contentType: 'text/html', body: '<!doctype html><body>Jeu de test</body>' }),
  );
  await page.goto('https://attestation.test/');
  // page.pdf() captures the actual print layout and sends Chromium’s afterprint.
  await page.evaluate(() => {
    window.printCalls = 0;
    window.print = () => { window.printCalls += 1; };
  });
  await page.addScriptTag({ path: scriptPath });
  return page;
}

async function submit(page, name, calls = 1) {
  await page.evaluate(() => SGAttestation.open({ jeu: 'Jeu de test', ratio: 0.95 }));
  await page.locator('#sga-name').fill(name);
  await page.locator('#sga-fn').fill('Service fictif');
  await page.locator('.sga-ok').click();
  await page.waitForFunction((count) => window.printCalls === count, calls);
}

async function assertClean(page, name) {
  await page.waitForFunction(() =>
    !document.querySelector('#sga-print, .sga-dlg') &&
    !document.documentElement.classList.contains('sga-printing'));
  assert.ok(!(await page.content()).includes(name));
}

function pages(info) {
  const count = /Pages:\s+(\d+)/.exec(info);
  assert.ok(count, info);
  return Number(count[1]);
}

async function render(page, printOptions) {
  const pdf = await page.pdf({ preferCSSPageSize: true, printBackground: true, ...printOptions });
  const text = execFileSync('pdftotext', ['-layout', '-', '-'], { input: pdf, encoding: 'utf8' });
  const info = execFileSync('pdfinfo', ['-'], { input: pdf, encoding: 'utf8' });
  return { text, info };
}

test('deux PDF A4 successifs ne contiennent que le nom correspondant', async (t) => {
  const page = await fixture(t);
  const baselinePath = process.env.ATTESTATION_BASELINE;
  const baseline = baselinePath && await fixture(t, baselinePath);
  const options = process.env.EXPLICIT_A4 ? { format: 'A4', landscape: true } : {};
  for (const [index, name] of [firstName, secondName].entries()) {
    await submit(page, name, index + 1);
    const { text, info } = await render(page, options);
    assert.ok(text.includes(name));
    assert.ok(!text.includes(index === 0 ? secondName : firstName));
    assert.ok(text.includes('Service fictif'));
    if (baseline) {
      await submit(baseline, name, index + 1);
      const original = await render(baseline, options);
      const cleanReference = s => s.replace(/SG-\d{8}-[A-Z0-9]{3}/g, 'SG-REFERENCE');
      console.log('PDF pages, original and patched:', pages(original.info), pages(info));
      console.log('Contains text by page:', text.split('\f').slice(0, -1).map(p => Boolean(p.trim())));
      assert.equal(pages(info), pages(original.info));
      assert.equal(cleanReference(text), cleanReference(original.text));
    }
    const size = /Page size:\s+([\d.]+) x ([\d.]+) pts/.exec(info);
    assert.ok(size, info);
    assert.ok(Math.abs(Number(size[1]) - 841.89) < 2, info);
    assert.ok(Math.abs(Number(size[2]) - 595.28) < 2, info);
    await assertClean(page, name);
  }
});
