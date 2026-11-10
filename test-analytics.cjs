// Test local du schéma de suivi. N'envoie aucune requête à Plausible.
const fs = require("fs"); const vm = require("vm"); const assert = require("assert");
const sent = [];
const ctx = { location: { origin: "https://jetpod.github.io", pathname: "/juste-une-perf/" }, window: {} };
ctx.window.plausible = n => sent.push(n);
vm.runInNewContext(fs.readFileSync(__dirname + "/analytics.js", "utf8"), ctx);
const A = ctx.window.jupAnalytics;
const goals = ["JUP Visite complète lancée", "JUP Visite express lancée", "JUP Visite essentiels lancée"];
for (let i = 1; i <= 14; i++) { const c = String(i).padStart(2, "0"); goals.push(`JUP Dossier ${c} validé`, `JUP Dossier ${c} erreur à risque`); }
goals.push("JUP Visite terminée sans erreur à risque", "JUP Visite terminée avec erreur à risque");
assert.strictEqual(goals.length, 33);
goals.forEach(g => assert.ok(A.allowed.test(g), g));
["Jeu démarré", "JUP Dossier 15 validé", "JUP Dossier 00 validé", "JUP Visite complète lancée x"].forEach(g => assert.ok(!A.allowed.test(g), g));
A.visitStarted("full"); A.visitStarted("autre"); A.caseValidated(3, true); A.caseValidated(14, false); A.visitEnded(true);
assert.deepStrictEqual(sent, ["JUP Visite complète lancée", "JUP Dossier 03 validé", "JUP Dossier 03 erreur à risque", "JUP Dossier 14 validé", "JUP Visite terminée avec erreur à risque"]);
const p = A.transformRequest({ n: "pageview", u: "https://jetpod.github.io/juste-une-perf/?x=1#a", r: "https://nutricellscience.blog/", p: { a: 1 }, $: 5 });
assert.strictEqual(p.u, "https://jetpod.github.io/juste-une-perf/"); assert.strictEqual(p.r, null); assert.ok(!("p" in p) && !("$" in p));
assert.strictEqual(A.transformRequest({ n: "Dossier validé" }), null);
console.log("OK : 33 objectifs autorisés, données nettoyées, événements hors liste bloqués.");
