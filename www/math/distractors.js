// distractors.js
// Construye opciones incorrectas que representan errores típicos del
// estudiante (no ruido aleatorio), y arma la lista final de opciones
// mezclada, garantizando que la respuesta correcta aparezca exactamente
// una vez y que no haya opciones duplicadas.

(function (global) {
  'use strict';
  const { pick, shuffle } = global.MathLock.SeededRandom;

  // candidatos: array de strings/numeros posibles (pueden incluir duplicados
  // entre sí o coincidir con la correcta; se filtran).
  function armarOpciones(rng, correcta, candidatos, cantidadTotal = 4) {
    const correctaStr = String(correcta);
    const unicos = [...new Set(candidatos.map(String))].filter(c => c !== correctaStr);
    const elegidos = shuffle(rng, unicos).slice(0, cantidadTotal - 1);

    // Si no hay suficientes distractores "de error común", completar con
    // variaciones numéricas simples cuando la respuesta es numérica.
    let intento = 0;
    while (elegidos.length < cantidadTotal - 1 && intento < 20) {
      intento++;
      const num = Number(correcta);
      if (!Number.isNaN(num)) {
        const variante = String(num + pick(rng, [1, -1, 2, -2, 3, -3]));
        if (variante !== correctaStr && !elegidos.includes(variante)) elegidos.push(variante);
      } else {
        break;
      }
    }

    const opciones = shuffle(rng, [...elegidos, correctaStr]);
    return opciones;
  }

  global.MathLock = global.MathLock || {};
  global.MathLock.Distractors = { armarOpciones };
})(window);
