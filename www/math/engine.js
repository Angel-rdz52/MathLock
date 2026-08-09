// engine.js
// Punto de entrada único para generar ejercicios. Reintenta si un ejercicio
// no pasa el validador (esto no debería pasar casi nunca, es red de
// seguridad). Evita repetir el mismo ejercicio dentro de una misma lección.

(function (global) {
  'use strict';
  const SR = global.MathLock.SeededRandom;

  function generateQuestion(skillId, dificultad, seed) {
    const gen = global.MathLock.Generators[skillId];
    if (!gen) return null;
    const rng = SR.make(seed != null ? seed : SR.freshSeed());
    for (let intento = 0; intento < 15; intento++) {
      const ex = gen(rng, dificultad);
      if (ex && global.MathLock.Validator.validar(ex)) return ex;
    }
    return null; // no debería ocurrir si los generadores están bien calibrados
  }

  function claveDuplicado(ex) {
    return `${ex.skillId}|${ex.question}`.replace(/\s+/g, '');
  }

  function generateLessonSession(skillId, dificultad, cantidad = 6) {
    const preguntas = [];
    const vistos = new Set();
    let intentos = 0;
    while (preguntas.length < cantidad && intentos < cantidad * 20) {
      intentos++;
      const ex = generateQuestion(skillId, dificultad);
      if (!ex) continue;
      const k = claveDuplicado(ex);
      if (vistos.has(k)) continue;
      vistos.add(k);
      preguntas.push(ex);
    }
    return preguntas;
  }

  // Sesión mixta a partir de una lista de {skillId, dificultad, cantidad}
  // (usada por scheduler.js para armar el repaso diario)
  function generateMixedSession(plan) {
    const preguntas = [];
    plan.forEach(({ skillId, dificultad, cantidad }) => {
      preguntas.push(...generateLessonSession(skillId, dificultad, cantidad));
    });
    return SR.shuffle(SR.make(SR.freshSeed()), preguntas);
  }

  global.MathLock = global.MathLock || {};
  global.MathLock.Engine = { generateQuestion, generateLessonSession, generateMixedSession };
})(window);
