// generators/equations.js — Etapa 4: Ecuaciones lineales
// Estrategia: se elige primero la solución x (entera), y se CONSTRUYE la
// ecuación a partir de ella. Esto garantiza matemáticamente que la
// respuesta es correcta (no depende de resolver después). Además se
// re-verifica sustituyendo x en la ecuación reconstruida (ver test.js).

(function (global) {
  'use strict';
  const { randInt, randNonZeroInt, pick, freshSeed } = global.MathLock.SeededRandom;

  function signoTexto(n) { return n < 0 ? '-' : '+'; }
  function coefX(coef) {
    if (coef === 1) return 'x';
    if (coef === -1) return '-x';
    return `${coef}x`;
  }

  function oneStepGen(rng, dificultad) {
    const rango = [10, 15, 20, 25, 30][dificultad - 1] || 15;
    const tipo = dificultad <= 2 ? pick(rng, ['suma_resta']) : pick(rng, ['suma_resta', 'multiplicacion']);
    const x = randNonZeroInt(rng, -rango, rango);

    if (tipo === 'suma_resta') {
      const a = randNonZeroInt(rng, -rango, rango);
      const b = x + a; // x + a = b
      return {
        question: `Resuelve: x + (${a}) = ${b}`,
        correctAnswer: x,
        explanation: `Resta ${a} en ambos lados: x = ${b} - (${a}) = ${x}.`,
        metadata: { a, b, tipo }
      };
    } else {
      const a = randNonZeroInt(rng, -12, 12);
      const b = a * x; // a*x = b
      return {
        question: `Resuelve: ${coefX(a)} = ${b}`,
        correctAnswer: x,
        explanation: `Divide ambos lados entre ${a}: x = ${b} ÷ ${a} = ${x}.`,
        metadata: { a, b, tipo }
      };
    }
  }

  function twoStepGen(rng, dificultad) {
    const rango = [10, 15, 20, 25, 30][dificultad - 1] || 15;
    const x = randNonZeroInt(rng, -rango, rango);
    const a = randNonZeroInt(rng, -12, 12);
    const b = randInt(rng, -rango, rango);
    const c = a * x + b;
    return {
      question: `Resuelve: ${coefX(a)} ${signoTexto(b)} ${Math.abs(b)} = ${c}`,
      correctAnswer: x,
      explanation: `Primero resta ${b} en ambos lados: ${coefX(a)} = ${c - b}. Después divide entre ${a}: x = ${(c - b) / a} = ${x}.`,
      metadata: { a, b, c }
    };
  }

  function bothSidesGen(rng, dificultad) {
    const rango = [8, 12, 15, 20, 25][dificultad - 1] || 12;
    const x = randNonZeroInt(rng, -rango, rango);
    let a = randNonZeroInt(rng, -10, 10);
    let c = randNonZeroInt(rng, -10, 10);
    while (c === a) c = randNonZeroInt(rng, -10, 10); // evitar 0x
    const b = randInt(rng, -rango, rango);
    const d = b - (c - a) * x; // despejado de: a*x+b = c*x+d

    return {
      question: `Resuelve: ${coefX(a)} ${signoTexto(b)} ${Math.abs(b)} = ${coefX(c)} ${signoTexto(d)} ${Math.abs(d)}`,
      correctAnswer: x,
      explanation: `Agrupa las x en un lado y los números en el otro: ${coefX(a)} ${signoTexto(-c)} ${Math.abs(c)}x = ${d} ${signoTexto(-b)} ${Math.abs(b)} → ${coefX(a - c)} = ${d - b} → x = ${x}.`,
      metadata: { a, b, c, d }
    };
  }

  const BUILDERS = {
    'equations.one_step': { fn: oneStepGen },
    'equations.two_step': { fn: twoStepGen },
    'equations.both_sides': { fn: bothSidesGen },
  };

  function generar(skillId, rng, dificultad) {
    const builder = BUILDERS[skillId];
    if (!builder) return null;
    const base = builder.fn(rng, dificultad);
    if (!base) return null;
    return {
      id: `${skillId}_${freshSeed()}`,
      skillId, type: 'numeric', difficulty: dificultad,
      question: base.question, correctAnswer: base.correctAnswer,
      explanation: base.explanation, metadata: base.metadata || {},
      generatorVersion: '1.0'
    };
  }

  global.MathLock = global.MathLock || {};
  global.MathLock.Generators = global.MathLock.Generators || {};
  Object.keys(BUILDERS).forEach(id => { global.MathLock.Generators[id] = (rng, dificultad) => generar(id, rng, dificultad); });
})(window);
