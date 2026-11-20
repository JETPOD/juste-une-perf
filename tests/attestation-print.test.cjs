// Run with: node --test tests/attestation-print.test.cjs (Node.js 20+).
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const { runInNewContext } = require('node:vm');

const source = readFileSync(path.join(__dirname, '..', 'attestation.js'), 'utf8');

function fixture({ native = true, printFails = false } = {}) {
  const timers = [];
  const body = new Set();
  const classes = new Set();
  const events = [];
  const captured = [];
  const media = new EventTarget();
  media.addListener = (handler) => media.addEventListener('change', handler);
  media.removeListener = (handler) => media.removeEventListener('change', handler);
  const window = new EventTarget();
  if (native) window.onafterprint = null;
  window.matchMedia = () => media;
  window.plausible = (...args) => events.push(args);
  const box = () => [...body].find((node) => node.id === 'sga-print');
  window.print = () => {
    captured.push(box().innerHTML);
    if (printFails) throw new Error('Impression indisponible');
  };

  const document = {
    documentElement: {
      classList: { add: (name) => classes.add(name), remove: (name) => classes.delete(name) },
      style: { setProperty() {} },
    },
    body: { appendChild: (node) => body.add(node) },
    head: { appendChild() {} },
    getElementById: (id) => [...body].find((node) => node.id === id),
    createElement(tag) {
      const node = new EventTarget();
      node.remove = () => body.delete(node);
      if (tag === 'dialog') {
        const fields = new Map(['#sga-name', '#sga-fn', '#sga-err', '.sga-no', 'form']
          .map((selector) => [selector, new EventTarget()]));
        node.querySelector = (selector) => fields.get(selector);
        node.querySelector('#sga-name').focus = () => {};
        node.close = () => node.dispatchEvent(new Event('close'));
        node.showModal = () => {};
        node.setAttribute = () => {};
      }
      return node;
    },
  };

  runInNewContext(source, {
    window, document, crypto: require('node:crypto').webcrypto,
    location: { origin: 'https://example.test', pathname: '/' },
    setTimeout(fn, delay) { timers.push({ fn, delay }); },
  });

  function advance(ms) {
    for (const job of timers) job.delay -= ms;
    while (true) {
      const index = timers.findIndex(({ delay }) => delay <= 0);
      if (index === -1) return;
      timers.splice(index, 1)[0].fn();
    }
  }

  function submit(name) {
    window.SGAttestation.open({ jeu: 'Jeu de test', ratio: 0.95 });
    const dlg = [...body].find((node) => node.className === 'sga-dlg');
    dlg.querySelector('#sga-name').value = name;
    dlg.querySelector('#sga-fn').value = 'Service fictif';
    dlg.querySelector('form').dispatchEvent(new Event('submit'));
    advance(80);
  }

  function assertClean() {
    assert.equal(body.size, 0);
    assert.equal(classes.has('sga-printing'), false);
  }

  return { window, box, captured, events, advance, submit, assertClean,
    changeMedia: (matches) => media.dispatchEvent(Object.assign(new Event('change'), { matches })),
  };
}

test('deux impressions successives capturent les bons noms puis nettoient le DOM', () => {
  const f = fixture();
  f.submit('Camille Dupont');
  assert.match(f.captured[0], /Camille Dupont/);
  assert.match(f.captured[0], /Service fictif/);
  f.window.dispatchEvent(new Event('afterprint'));
  f.assertClean();
  f.submit('Morgan Martin');
  assert.match(f.captured[1], /Morgan Martin/);
  assert.doesNotMatch(f.captured[1], /Camille Dupont/);
  f.window.dispatchEvent(new Event('afterprint'));
  f.assertClean();
  assert.deepEqual(f.events, [['Attestation · Excellence'], ['Attestation · Excellence']]);
});

test('l’aperçu asynchrone conserve le nom au-delà de 1,5 s, puis l’annulation le retire', () => {
  const f = fixture();
  f.submit('Camille Dupont');
  f.advance(2000);
  assert.match(f.box().innerHTML, /Camille Dupont/);
  f.window.dispatchEvent(new Event('afterprint'));
  f.assertClean();
});

test('sans afterprint, la sortie du média impression retire l’attestation', () => {
  const f = fixture({ native: false });
  f.submit('Camille Dupont');
  f.changeMedia(true);
  assert.match(f.box().innerHTML, /Camille Dupont/);
  f.changeMedia(false);
  f.assertClean();
});

test('avec afterprint, un changement de média ne retire pas prématurément l’attestation', () => {
  const f = fixture();
  f.submit('Camille Dupont');
  f.changeMedia(true);
  f.changeMedia(false);
  assert.match(f.box().innerHTML, /Camille Dupont/);
  f.window.dispatchEvent(new Event('afterprint'));
  f.assertClean();
});

test('une exception de window.print retire l’attestation et autorise une nouvelle tentative', () => {
  const f = fixture({ printFails: true });
  f.submit('Camille Dupont');
  f.assertClean();
  f.submit('Morgan Martin');
  f.assertClean();
  assert.match(f.captured[1], /Morgan Martin/);
});

test('quitter la page retire aussi l’attestation', () => {
  const f = fixture();
  f.submit('Camille Dupont');
  f.window.dispatchEvent(new Event('pagehide'));
  f.assertClean();
});

test('les seuils et la règle d’erreur critique restent identiques', () => {
  const { palier } = fixture().window.SGAttestation;
  const cases = [[0.799, 0], [0.8, 0], [0.949, 0], [0.95, 0], [1, 1], [0.95, null]];
  assert.deepEqual(cases.map((args) => palier(...args)),
    ['participation', 'reussite', 'reussite', 'excellence', 'participation', 'excellence']);
});
