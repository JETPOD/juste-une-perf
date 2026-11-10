/* Juste une perf ? · Mesure d'audience Plausible.
   Schéma fermé : aucun texte libre, aucun score individuel, aucune propriété personnalisée,
   aucun identifiant d'apprenant. Ce fichier doit précéder l'initialisation de Plausible.
   Les noms commencent par « Juste une perf · » pour les distinguer des autres jeux du site jetpod.github.io. */
(() => {
  const allowed = /^(pageview|engagement|Juste une perf · Visite (complète|express|essentiels) lancée|Juste une perf · Dossier (0[1-9]|1[0-4]) (validé|erreur à risque)|Juste une perf · Visite terminée (sans|avec) erreur à risque)$/;
  const MODES = { full: "complète", express: "express", essentiel: "essentiels" };
  function send(name) {
    if (!allowed.test(name)) return;
    try { if (typeof window.plausible === "function") window.plausible(name); } catch (e) { /* Ne jamais bloquer le jeu. */ }
  }
  window.jupAnalytics = {
    allowed,
    transformRequest(payload) {
      if (!payload || !allowed.test(payload.n)) return null;
      payload.u = location.origin + location.pathname;
      payload.r = null;
      delete payload.p;
      delete payload.$;
      return payload;
    },
    visitStarted(mode) { if (MODES[mode]) send(`Juste une perf · Visite ${MODES[mode]} lancée`); },
    caseValidated(num, hadRisk) {
      const code = String(num).padStart(2, "0");
      send(`Juste une perf · Dossier ${code} validé`);
      if (hadRisk) send(`Juste une perf · Dossier ${code} erreur à risque`);
    },
    visitEnded(hadRisk) { send(`Juste une perf · Visite terminée ${hadRisk ? "avec" : "sans"} erreur à risque`); }
  };
})();
