// scheduler.js
// Decide qué estudiar, no simplemente "siguiente lección". Combina:
// habilidades nuevas desbloqueadas, repasos debidos (spaced repetition),
// habilidades débiles y un desafío sobre algo ya dominado.

(function (global) {
  'use strict';
  const { SKILLS, prerequisitosCumplidos } = global.MathLock.Skills;
  const { ETAPAS } = global.MathLock.Curriculum;

  function skillsImplementados() {
    return ETAPAS.filter(e => e.implemented).flatMap(e => e.skills);
  }

  function dificultadPara(masteryMap, skillId) {
    return masteryMap[skillId]?.difficultyEstimate || 1;
  }

  // Próxima habilidad "nueva" a aprender: la primera (en orden curricular)
  // cuyos prerrequisitos ya se cumplen y que todavía no está dominada.
  function proximaHabilidad(masteryMap) {
    const orden = skillsImplementados();
    for (const skillId of orden) {
      const umbral = SKILLS[skillId].masteryThreshold;
      const mastery = masteryMap[skillId]?.mastery || 0;
      if (mastery >= umbral) continue;
      if (!prerequisitosCumplidos(skillId, masteryMap)) continue;
      return skillId;
    }
    return null; // currículum implementado agotado (hasta que se agreguen más etapas)
  }

  function habilidadesDebiles(masteryMap, maxN = 3) {
    return Object.keys(masteryMap)
      .filter(id => SKILLS[id] && masteryMap[id].attempts > 0 && masteryMap[id].mastery < SKILLS[id].masteryThreshold)
      .sort((a, b) => masteryMap[a].mastery - masteryMap[b].mastery)
      .slice(0, maxN);
  }

  function repasosDebidos(masteryMap, maxN = 3) {
    const ahora = Date.now();
    return Object.keys(masteryMap)
      .filter(id => SKILLS[id] && masteryMap[id].nextReview && masteryMap[id].nextReview <= ahora)
      .sort((a, b) => (masteryMap[a].nextReview - masteryMap[b].nextReview))
      .slice(0, maxN);
  }

  function habilidadDominada(masteryMap) {
    const dominadas = Object.keys(masteryMap).filter(id => SKILLS[id] && masteryMap[id].mastery >= SKILLS[id].masteryThreshold);
    if (dominadas.length === 0) return null;
    return dominadas[Math.floor(Math.random() * dominadas.length)];
  }

  // Arma el plan del repaso diario (~10 preguntas), mezclando fuentes.
  function planRepasoDiario(masteryMap) {
    const plan = [];
    const actual = proximaHabilidad(masteryMap);
    const debiles = habilidadesDebiles(masteryMap);
    const debidos = repasosDebidos(masteryMap).filter(id => id !== actual && !debiles.includes(id));
    const desafio = habilidadDominada(masteryMap);

    if (actual) plan.push({ skillId: actual, dificultad: dificultadPara(masteryMap, actual), cantidad: 4 });
    debidos.slice(0, 2).forEach(id => plan.push({ skillId: id, dificultad: dificultadPara(masteryMap, id), cantidad: 2 }));
    debiles.slice(0, 1).forEach(id => plan.push({ skillId: id, dificultad: Math.max(1, dificultadPara(masteryMap, id) - 1), cantidad: 2 }));
    if (desafio && desafio !== actual) plan.push({ skillId: desafio, dificultad: Math.min(5, dificultadPara(masteryMap, desafio) + 1), cantidad: 1 });

    // Si es la primerísima vez (sin historial), practica solo la habilidad actual
    if (plan.length === 1 && Object.keys(masteryMap).length === 0) {
      plan[0].cantidad = 6;
    }
    return plan;
  }

  global.MathLock = global.MathLock || {};
  global.MathLock.Scheduler = { proximaHabilidad, habilidadesDebiles, repasosDebidos, habilidadDominada, planRepasoDiario };
})(window);
