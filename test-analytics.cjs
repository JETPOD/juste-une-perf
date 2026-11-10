// Test local du schéma de suivi. N'envoie aucune requête à Plausible.
const fs = require("fs"); const vm = require("vm"); const assert = require("assert");
const sent = [];
const ctx = { location: { origin: "https://jetpod.github.io", pathname: "/juste-une-perf/" }, window: {} };
ctx.window.plausible = n => sent.push(n);
vm.runInNewContext(fs.readFileSync(__dirname + "/analytics.js", "utf8"), ctx);
const A = ctx.window.jupAnalytics;
const goals = ["Juste une perf · Visite complète lancée", "Juste une perf · Visite express lancée", "Juste une perf · Visite essentiels lancée"];
for (let i = 1; i <= 14; i++) { const c = String(i).padStart(2, "0"); goals.push(`Juste une perf · Dossier ${c} validé`, `Juste une perf · Dossier ${c} erreur à risque`); }
goals.push("Juste une perf · Visite terminée sans erreur à risque", "Juste une perf · Visite terminée avec erreur à risque");
assert.strictEqual(goals.length, 33);
goals.forEach(g => assert.ok(A.allowed.test(g), g));
["Jeu démarré", "Juste une perf · Dossier 15 validé", "Juste une perf · Dossier 00 validé", "Juste une perf · Visite complète lancée x"].forEach(g => assert.ok(!A.allowed.test(g), g));
A.visitStarted("full"); A.visitStarted("autre"); A.caseValidated(3, true); A.caseValidated(14, false); A.visitEnded(true);
assert.deepStrictEqual(sent, ["Juste une perf · Visite complète lancée", "Juste une perf · Dossier 03 validé", "Juste une perf · Dossier 03 erreur à risque", "Juste une perf · Dossier 14 validé", "Juste une perf · Visite terminée avec erreur à risque"]);
const p = A.transformRequest({ n: "pageview", u: "https://jetpod.github.io/juste-une-perf/?x=1#a", r: "https://nutricellscience.blog/", p: { a: 1 }, $: 5 });
assert.strictEqual(p.u, "https://jetpod.github.io/juste-une-perf/"); assert.strictEqual(p.r, null); assert.ok(!("p" in p) && !("$" in p));
assert.strictEqual(A.transformRequest({ n: "Dossier validé" }), null);
console.log("OK : 33 objectifs autorisés, données nettoyées, événements hors liste bloqués.");
