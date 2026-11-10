(function () {
  "use strict";

  const app = document.getElementById("app");
  const hud = document.getElementById("hud");
  const hudCase = document.getElementById("hudCase");
  const hudScore = document.getElementById("hudScore");
  const hudDays = document.getElementById("hudDays");
  const progressBar = document.getElementById("progressBar");

  const PTS = { crit: 1, line: 3, lineMid: 2, mol: 2, kt: 4, ktMid: 2 };

  let S = null;

  function shuffle(a) {
    const r = a.slice();
    for (let i = r.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [r[i], r[j]] = [r[j], r[i]];
    }
    return r;
  }

  function el(html) {
    const t = document.createElement("template");
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }

  const A = window.jupAnalytics || { visitStarted() {}, caseValidated() {}, visitEnded() {} };

  function updateHud() {
    if (!S) { hud.hidden = true; progressBar.style.width = "0"; return; }
    hud.hidden = false;
    hudCase.textContent = Math.min(S.idx + 1, S.queue.length) + "/" + S.queue.length;
    hudScore.textContent = S.score + " / " + S.max;
    hudDays.textContent = S.days;
    const done = S.idx + (S.validated ? 1 : 0);
    progressBar.style.width = (done / S.queue.length * 100) + "%";
  }

  /* ---------- Accueil ---------- */
  function renderHome() {
    S = null;
    updateHud();
    app.innerHTML = "";
    const node = el(`
      <section class="hero">
        <div>
          <p class="eyebrow">Visite du matin · Médecine polyvalente</p>
          <h1>Chaque cathéter doit se justifier, chaque jour.</h1>
          <p class="lead">Vous faites le tour du service avec le dossier de soins. Pour chaque patient, décidez si les traitements intraveineux peuvent passer per os, s'arrêter ou doivent continuer, puis si le cathéter a encore sa place.</p>
          <ol class="steps">
            <li><span class="n">1</span><div><strong>Grille de relais</strong><span class="d">Cinq critères à vérifier quand un antibiotique est administré par voie IV.</span></div></li>
            <li><span class="n">2</span><div><strong>Lignes IV</strong><span class="d">Relais per os, poursuite IV, voie sous-cutanée ou arrêt, ligne par ligne, et choix de la molécule orale.</span></div></li>
            <li><span class="n">3</span><div><strong>Le cathéter</strong><span class="d">Maintenir, retirer, reposer ou changer de dispositif.</span></div></li>
          </ol>
        </div>
        <div class="card start">
          <h2>Choisir une visite</h2>
          <button class="mode" type="button" data-mode="full"><strong>Visite complète</strong><span>${CASES.length} dossiers, du cathéter dormant à l'endocardite. Environ 25 minutes.</span></button>
          <button class="mode" type="button" data-mode="express"><strong>Visite express</strong><span>6 dossiers tirés au hasard. Environ 10 minutes.</span></button>
          <button class="mode" type="button" data-mode="essentiel"><strong>Les essentiels</strong><span>Les dossiers de niveau « Essentiel », pour une première approche ou un accueil des nouveaux arrivants.</span></button>
          <p class="note">Barème : 1 point par critère de la grille, 3 points par ligne IV, 2 points par molécule de relais, 4 points pour la décision sur le cathéter. Les réponses défendables mais non optimales rapportent des points partiels.</p>
        </div>
      </section>`);
    node.querySelectorAll(".mode").forEach(b => b.addEventListener("click", () => start(b.dataset.mode)));
    app.appendChild(node);
  }

  function start(mode) {
    let queue;
    if (mode === "express") queue = shuffle(CASES).slice(0, 6);
    else if (mode === "essentiel") queue = CASES.filter(c => c.niveau === "Essentiel");
    else queue = CASES.slice();
    S = { mode, queue, idx: 0, score: 0, max: 0, days: 0, risk: 0, missedKt: 0, relais: 0, relaisPossibles: 0, results: [], validated: false };
    A.visitStarted(mode);
    renderCase();
  }

  /* ---------- Dossier ---------- */
  function renderCase() {
    const c = S.queue[S.idx];
    S.validated = false;
    S.ans = { crit: {}, lines: c.lignes.map(() => ({ voie: null, mol: null })), kt: null };
    updateHud();
    app.innerHTML = "";
    window.scrollTo({ top: 0 });

    const v = c.constantes;
    const tm = String(v.T).match(/^([\d,]+)\s*(.*)$/);
    const tVal = tm ? tm[1] : v.T;
    const tNote = tm && tm[2] ? tm[2].replace(/^\(|\)$/g, "") : "";
    const sm = String(v.SpO2).match(/^(\d+ %)\s*(.*)$/);
    const sVal = sm ? sm[1] : v.SpO2;
    const sNote = sm && sm[2] ? sm[2] : "";
    const notes = [tNote ? "Température : " + tNote : "", sNote ? "SpO₂ " + sNote : ""].filter(Boolean).join(" · ");
    const node = el(`
      <section>
        <div class="case-head">
          <h1>${c.titre}</h1>
          <div class="tags"><span class="tag">Chambre ${c.chambre}</span><span class="tag">${c.jour}</span><span class="tag lvl-${c.niveau}">${c.niveau}</span></div>
        </div>
        <div class="layout">
          <aside class="card chart" aria-label="Dossier patient">
            <p class="who">${c.patient}</p>
            <p class="motif">${c.motif}</p>
            <div class="vitals">
              <div class="vital"><span class="k">T °C</span><span class="v">${tVal}</span></div>
              <div class="vital"><span class="k">FC</span><span class="v">${v.FC}</span></div>
              <div class="vital"><span class="k">PAS</span><span class="v">${v.PAS}</span></div>
              <div class="vital"><span class="k">FR</span><span class="v">${v.FR}</span></div>
              <div class="vital"><span class="k">SpO₂</span><span class="v">${sVal}</span></div>
            </div>
            ${notes ? `<p class="tnote">${notes}</p>` : ""}
            <dl class="facts">
              <div><dt>Biologie</dt><dd>${c.bio}</dd></div>
              <div><dt>Voie digestive</dt><dd>${c.digestif}</dd></div>
              <div><dt>Microbiologie</dt><dd>${c.microbio}</dd></div>
            </dl>
            <div class="kt-card">
              <div class="kt-title"><svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20l6-6M10 14l7-7 3 3-7 7zM15 5l4 4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>${c.kt.type}</div>
              <dl>
                <dt>Site</dt><dd>${c.kt.site}</dd>
                <dt>Pose</dt><dd>${c.kt.pose}</dd>
                <dt>État</dt><dd>${c.kt.etat}</dd>
              </dl>
            </div>
          </aside>
          <div class="decisions" id="decisions"></div>
        </div>
      </section>`);
    app.appendChild(node);
    const dec = node.querySelector("#decisions");
    let step = 1;

    // Bloc 1 : grille
    if (c.ivos) {
      const b = el(`<div class="card block"><div class="block-head"><span class="n">${step++}</span><h2>Grille de relais de l'antibiotique</h2></div><p class="hint">Répondez à chaque critère à partir du dossier.</p><div class="crits"></div></div>`);
      const wrap = b.querySelector(".crits");
      CRITERES.forEach(cr => {
        const row = el(`<div class="crit" data-crit="${cr.id}"><span class="crit-label">${cr.label}</span><div class="seg" role="group" aria-label="${cr.label}"><button type="button" data-v="1" aria-pressed="false">Oui</button><button type="button" data-v="0" aria-pressed="false">Non</button></div></div>`);
        row.querySelectorAll("button").forEach(btn => btn.addEventListener("click", () => {
          if (S.validated) return;
          S.ans.crit[cr.id] = btn.dataset.v === "1";
          row.querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", String(x === btn)));
          refreshValidate();
        }));
        wrap.appendChild(row);
      });
      dec.appendChild(b);
    }

    // Bloc 2 : lignes
    const bl = el(`<div class="card block"><div class="block-head"><span class="n">${step++}</span><h2>Traitements et perfusions IV</h2></div><p class="hint">Décidez pour chaque ligne prescrite.</p><div class="lines"></div></div>`);
    const lw = bl.querySelector(".lines");
    c.lignes.forEach((ln, i) => {
      const row = el(`<div class="line" data-line="${i}"><span class="line-label">${ln.label}</span><div class="choices" role="group" aria-label="${ln.label}"></div><div class="mol-slot"></div><div class="fb-slot"></div></div>`);
      const ch = row.querySelector(".choices");
      ln.options.forEach(o => {
        const btn = el(`<button type="button" class="choice" data-v="${o}" aria-pressed="false">${VOIES[o]}</button>`);
        btn.addEventListener("click", () => {
          if (S.validated) return;
          S.ans.lines[i].voie = o;
          ch.querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", String(x === btn)));
          renderMol(row, ln, i);
          refreshValidate();
        });
        ch.appendChild(btn);
      });
      lw.appendChild(row);
    });
    dec.appendChild(bl);

    // Bloc 3 : cathéter
    const bk = el(`<div class="card block"><div class="block-head"><span class="n">${step++}</span><h2>Et le cathéter ?</h2></div><p class="hint">Compte tenu de vos décisions ci-dessus.</p><div class="kt-choices" role="group" aria-label="Décision sur le cathéter"></div><div class="fb-slot"></div></div>`);
    const kc = bk.querySelector(".kt-choices");
    Object.keys(KT_OPTIONS).forEach(k => {
      const btn = el(`<button type="button" class="choice" data-v="${k}" aria-pressed="false">${KT_OPTIONS[k]}</button>`);
      btn.addEventListener("click", () => {
        if (S.validated) return;
        S.ans.kt = k;
        kc.querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", String(x === btn)));
        refreshValidate();
      });
      kc.appendChild(btn);
    });
    dec.appendChild(bk);

    const act = el(`<div class="actions"><span class="missing" id="missing"></span><button class="btn" id="validate" type="button" disabled>Valider mes décisions</button></div>`);
    act.querySelector("#validate").addEventListener("click", validate);
    dec.appendChild(act);
    refreshValidate();
  }

  function renderMol(row, ln, i) {
    const slot = row.querySelector(".mol-slot");
    slot.innerHTML = "";
    S.ans.lines[i].mol = null;
    if (!ln.molecule || S.ans.lines[i].voie !== "po") return;
    const m = el(`<div class="mol"><p>${ln.molecule.question}</p><div class="choices" role="group" aria-label="${ln.molecule.question}"></div></div>`);
    const ch = m.querySelector(".choices");
    ln.molecule.options.forEach((o, k) => {
      const btn = el(`<button type="button" class="choice" data-k="${k}" aria-pressed="false">${o}</button>`);
      btn.addEventListener("click", () => {
        if (S.validated) return;
        S.ans.lines[i].mol = k;
        ch.querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", String(x === btn)));
        refreshValidate();
      });
      ch.appendChild(btn);
    });
    slot.appendChild(m);
  }

  function missingCount() {
    const c = S.queue[S.idx];
    let n = 0;
    if (c.ivos) CRITERES.forEach(cr => { if (!(cr.id in S.ans.crit)) n++; });
    c.lignes.forEach((ln, i) => {
      const a = S.ans.lines[i];
      if (!a.voie) n++;
      else if (ln.molecule && a.voie === "po" && a.mol === null) n++;
    });
    if (!S.ans.kt) n++;
    return n;
  }

  function refreshValidate() {
    const btn = document.getElementById("validate");
    const miss = document.getElementById("missing");
    if (!btn) return;
    const n = missingCount();
    btn.disabled = n > 0;
    miss.textContent = n > 0 ? (n === 1 ? "Encore 1 décision" : "Encore " + n + " décisions") : "";
  }

  function grade(choice, correct, acceptable) {
    if (correct.includes(choice)) return "ok";
    if (acceptable && acceptable.includes(choice)) return "mid";
    return "ko";
  }

  function fbBox(kind, text, extra) {
    const title = { ok: "Bonne décision", mid: "Défendable", ko: "À revoir" }[kind];
    return el(`<div class="fb ${kind}"><strong>${extra ? extra + " · " : ""}${title}</strong><span>${text}</span></div>`);
  }

  function validate() {
    if (S.validated || missingCount() > 0) return;
    S.validated = true;
    const c = S.queue[S.idx];
    let pts = 0, max = 0, riskHere = 0;

    // Grille
    if (c.ivos) {
      CRITERES.forEach(cr => {
        max += PTS.crit;
        const row = app.querySelector(`[data-crit="${cr.id}"]`);
        const good = S.ans.crit[cr.id] === c.ivos[cr.id];
        if (good) pts += PTS.crit;
        row.querySelectorAll("button").forEach(b => { b.disabled = true; });
        row.appendChild(el(`<span class="fbmark ${good ? "ok" : "ko"}">${good ? "Juste" : "Attendu : " + (c.ivos[cr.id] ? "Oui" : "Non")}</span>`));
      });
    }

    // Lignes
    c.lignes.forEach((ln, i) => {
      const a = S.ans.lines[i];
      const row = app.querySelector(`[data-line="${i}"]`);
      const g = grade(a.voie, ln.correct, ln.acceptable);
      max += PTS.line;
      pts += g === "ok" ? PTS.line : g === "mid" ? PTS.lineMid : 0;
      const isRisk = ln.risk && ln.risk.includes(a.voie);
      if (isRisk) riskHere++;
      if (ln.correct.includes("po") || (ln.acceptable || []).includes("po")) {
        if (ln.correct[0] === "po") { S.relaisPossibles++; if (a.voie === "po") S.relais++; }
      }
      row.querySelectorAll(".choices").forEach((grp, gi) => {
        grp.querySelectorAll("button").forEach(b => {
          b.disabled = true;
          if (gi === 0) {
            const v = b.dataset.v;
            if (ln.correct.includes(v)) b.classList.add("is-ok");
            else if ((ln.acceptable || []).includes(v)) b.classList.add("is-mid");
            else b.classList.add("is-ko");
          }
        });
      });
      const slot = row.querySelector(".fb-slot");
      slot.appendChild(fbBox(isRisk ? "ko" : g, ln.feedback, isRisk ? "Erreur à risque" : ""));

      if (ln.molecule && ln.correct.includes("po")) {
        max += PTS.mol;
        if (a.voie === "po") {
          const good = a.mol === ln.molecule.correct;
          if (good) pts += PTS.mol;
          const molBtns = row.querySelectorAll(".mol .choice");
          molBtns.forEach(b => {
            const k = Number(b.dataset.k);
            b.classList.add(k === ln.molecule.correct ? "is-ok" : "is-ko");
          });
          slot.appendChild(fbBox(good ? "ok" : "ko", ln.molecule.feedback, "Molécule"));
        } else {
          slot.appendChild(fbBox("mid", "Bon relais attendu : " + ln.molecule.options[ln.molecule.correct] + ". " + ln.molecule.feedback, "Molécule"));
        }
      }
    });

    // Cathéter
    const kd = c.ktDecision;
    const gk = grade(S.ans.kt, kd.correct, kd.acceptable);
    max += PTS.kt;
    pts += gk === "ok" ? PTS.kt : gk === "mid" ? PTS.ktMid : 0;
    const ktRisk = kd.risk.includes(S.ans.kt);
    if (ktRisk) riskHere++;
    if (kd.correct.includes("retirer") && S.ans.kt === "maintenir") S.missedKt++;
    let daysHere = 0;
    if (kd.joursEvites > 0 && gk === "ok") daysHere = kd.joursEvites;
    S.days += daysHere;
    app.querySelectorAll(".kt-choices button").forEach(b => {
      b.disabled = true;
      const v = b.dataset.v;
      if (kd.correct.includes(v)) b.classList.add("is-ok");
      else if (kd.acceptable.includes(v)) b.classList.add("is-mid");
      else b.classList.add("is-ko");
    });
    const ktBlock = app.querySelector(".kt-choices").parentElement;
    ktBlock.querySelector(".fb-slot").appendChild(fbBox(ktRisk ? "ko" : gk, kd.feedback + (daysHere ? " Estimation : " + daysHere + " jour" + (daysHere > 1 ? "s" : "") + "-cathéter évité" + (daysHere > 1 ? "s" : "") + "." : ""), ktRisk ? "Erreur à risque" : ""));

    S.score += pts; S.max += max; S.risk += riskHere;
    const ratio = pts / max;
    S.results.push({ titre: c.titre, patient: c.patient, pts, max, risk: riskHere, kind: riskHere ? "ko" : ratio >= .8 ? "ok" : ratio >= .5 ? "mid" : "ko" });

    // Message clé
    const last = S.idx === S.queue.length - 1;
    const tk = el(`<div class="takeaway" role="status"><span class="k">À retenir</span><p>${c.message}</p><span class="case-score">${pts} / ${max} points sur ce dossier${riskHere ? " · " + riskHere + " erreur" + (riskHere > 1 ? "s" : "") + " à risque" : ""}</span><ul>${c.sources.map(s => `<li><a href="${SOURCES[s].url}" target="_blank" rel="noopener">${SOURCES[s].label}</a></li>`).join("")}</ul></div>`);
    const actions = app.querySelector(".actions");
    actions.innerHTML = "";
    actions.parentElement.insertBefore(tk, actions);
    const next = el(`<button class="btn" type="button">${last ? "Voir le bilan de la visite" : "Dossier suivant"}</button>`);
    next.addEventListener("click", () => { if (last) renderEnd(); else { S.idx++; renderCase(); } });
    actions.appendChild(next);
    updateHud();
    tk.scrollIntoView({ behavior: "smooth", block: "nearest" });
    A.caseValidated(CASES.indexOf(c) + 1, riskHere > 0);
  }

  /* ---------- Bilan ---------- */
  function renderEnd() {
    const pct = Math.round(S.score / S.max * 100);
    let label, sub;
    if (pct >= 85 && S.risk === 0) { label = "Référent pertinence"; sub = "Vos décisions retirent des cathéters inutiles sans prendre de risque pour le patient."; }
    else if (pct >= 65) { label = "Bon réflexe de réévaluation"; sub = "La démarche est acquise. Quelques situations particulières méritent un second regard."; }
    else { label = "Réévaluation à consolider"; sub = "Reprenez la grille de relais et la règle de retrait dès que l'indication disparaît."; }
    if (!S.ended) { S.ended = true; A.visitEnded(S.risk > 0); }
    S.idx = S.queue.length - 1; S.validated = true; updateHud();

    app.innerHTML = "";
    const usedSources = [...new Set(S.queue.flatMap(c => c.sources))];
    const node = el(`
      <section class="end">
        <div class="end-top">
          <div>
            <p class="eyebrow">Bilan de la visite</p>
            <h1 class="grade">${label}</h1>
            <p class="lead">${sub}</p>
          </div>
          <div class="kpis">
            <div class="card kpi"><div class="v">${pct} %</div><div class="k">Score (${S.score} / ${S.max} points)</div></div>
            <div class="card kpi"><div class="v">${S.days}</div><div class="k">Jours-cathéter évités (estimation)</div></div>
            <div class="card kpi"><div class="v">${S.relais} / ${S.relaisPossibles}</div><div class="k">Relais per os pertinents réalisés</div></div>
            <div class="card kpi ${S.risk ? "alert" : ""}"><div class="v">${S.risk}</div><div class="k">Erreurs à risque${S.missedKt ? " · " + S.missedKt + " cathéter" + (S.missedKt > 1 ? "s" : "") + " inutile" + (S.missedKt > 1 ? "s" : "") + " laissé" + (S.missedKt > 1 ? "s" : "") : ""}</div></div>
          </div>
        </div>
        <div class="card review" aria-label="Détail par dossier">
          ${S.results.map(r => `<div class="review-row"><span class="dot ${r.kind}">${r.kind === "ok" ? "✓" : r.kind === "mid" ? "~" : "!"}</span><div><div class="t">${r.titre}</div><div class="s">${r.patient}${r.risk ? " · erreur à risque" : ""}</div></div><span class="pts">${r.pts}/${r.max}</span></div>`).join("")}
        </div>
        <div class="card memo">
          <h2>La règle de la visite</h2>
          <ol>
            <li>Chaque matin, pour chaque cathéter : à quoi sert-il aujourd'hui ? Sans réponse, il se retire.</li>
            <li>Un antibiotique IV se réévalue à 48 heures puis chaque jour : apyrexie, amélioration, voie digestive, molécule orale adaptée, situation particulière.</li>
            <li>Une situation particulière (bactériémie, endocardite, méningite, infection ostéo-articulaire, abcès non drainé) impose un avis référent, pas forcément la voie IV.</li>
            <li>Le relais se fait vers une molécule à bonne biodisponibilité, guidée par l'antibiogramme, pas vers « la même en comprimé ».</li>
            <li>Réviser toute l'ordonnance IV : paracétamol, IPP, diurétiques, potassium, hydratation, aminosides.</li>
            <li>Quand la voie veineuse devient une contrainte, penser aux voies orale et sous-cutanée.</li>
          </ol>
        </div>
        <div class="card memo">
          <h2>Références utilisées</h2>
          <ul class="sources-list">${usedSources.map(s => `<li><a href="${SOURCES[s].url}" target="_blank" rel="noopener">${SOURCES[s].label}</a></li>`).join("")}</ul>
        </div>
        <div class="actions">
          <button class="btn ghost" type="button" id="home2">Changer de visite</button>
          <button class="btn" type="button" id="again">Rejouer cette visite</button>
        </div>
      </section>`);
    node.querySelector("#home2").addEventListener("click", renderHome);
    node.querySelector("#again").addEventListener("click", () => start(S.mode));
    app.appendChild(node);
    window.scrollTo({ top: 0 });
  }

  document.getElementById("homeBtn").addEventListener("click", renderHome);
  renderHome();
})();
