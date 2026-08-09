// diagnostic.js
// Diagnóstico corto y adaptativo: recorre las habilidades implementadas en
// orden curricular. Por cada una hace 1-2 preguntas a dificultad media;
// si acierta, asume dominio razonable y avanza rápido; si falla, indaga un
// poco más con una pregunta más fácil y la marca como "a reforzar". No
// penaliza errores más allá de eso (no hay "fallar el diagnóstico").
// Presupuesto total: ~20-25 preguntas.

(function (global) {
  'use strict';
  const { ETAPAS } = global.MathLock.Curriculum;
  const { SKILLS } = global.MathLock.Skills;
  const Mastery = global.MathLock.Mastery;
  const Engine = global.MathLock.Engine;

  const PRESUPUESTO_MAX = 24;

  function skillsOrdenados() {
    return ETAPAS.filter(e => e.implemented).flatMap(e => e.skills);
  }

  function crearSesion() {
    return {
      cola: skillsOrdenados().map(id => ({ skillId: id, intentosHechos: 0 })),
      indice: 0,
      preguntasHechas: 0,
      masteryMap: {},
      preguntaActual: null,
    };
  }

  function estaCompleto(sesion) {
    return sesion.indice >= sesion.cola.length || sesion.preguntasHechas >= PRESUPUESTO_MAX;
  }

  function siguientePregunta(sesion) {
    if (estaCompleto(sesion)) return null;
    const item = sesion.cola[sesion.indice];
    const dificultad = item.intentosHechos === 0 ? 2 : 1; // segunda vuelta: más fácil
    const ex = Engine.generateQuestion(item.skillId, dificultad);
    sesion.preguntaActual = ex;
    return ex;
  }

  function registrarRespuesta(sesion, correcto) {
    const item = sesion.cola[sesion.indice];
    const ex = sesion.preguntaActual;
    sesion.preguntasHechas += 1;
    item.intentosHechos += 1;

    const prev = sesion.masteryMap[item.skillId] || Mastery.estadoInicial();
    sesion.masteryMap[item.skillId] = Mastery.actualizar(prev, correcto, ex ? ex.difficulty : 1);

    if (correcto) {
      // Acertó: asumimos dominio razonable de esta habilidad, avanzar.
      sesion.indice += 1;
    } else if (item.intentosHechos >= 2) {
      // Ya la indagamos dos veces: queda marcada como débil, avanzar igual.
      sesion.indice += 1;
    }
    // Si falló en el primer intento, se repite una vez más (más fácil) antes de avanzar.
  }

  function resultadoFinal(sesion) {
    const masteryMap = sesion.masteryMap;
    const fortalezas = [];
    const debilidades = [];
    Object.keys(masteryMap).forEach(id => {
      const umbral = SKILLS[id]?.masteryThreshold || 0.8;
      if (masteryMap[id].mastery >= umbral * 0.75) fortalezas.push(id);
      else debilidades.push(id);
    });

    // Etapa recomendada: la primera etapa implementada donde el promedio de
    // mastery de sus habilidades evaluadas quede por debajo del umbral.
    let etapaRecomendada = ETAPAS.find(e => e.implemented)?.id || null;
    for (const etapa of ETAPAS.filter(e => e.implemented)) {
      const idsEvaluados = etapa.skills.filter(id => masteryMap[id]);
      if (idsEvaluados.length === 0) continue;
      const promedio = idsEvaluados.reduce((s, id) => s + masteryMap[id].mastery, 0) / idsEvaluados.length;
      if (promedio < 0.7) { etapaRecomendada = etapa.id; break; }
      etapaRecomendada = etapa.id; // si domina esta etapa, seguir buscando la siguiente sin dominar
    }

    return { masteryMap, fortalezas, debilidades, etapaRecomendada };
  }

  global.MathLock = global.MathLock || {};
  global.MathLock.Diagnostic = { crearSesion, estaCompleto, siguientePregunta, registrarRespuesta, resultadoFinal };
})(window);
