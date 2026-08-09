// generators/arithmetic.js — Etapa 1: Números y operaciones
(function (global) {
  'use strict';
  const { randInt, randNonZeroInt, pick, freshSeed } = global.MathLock.SeededRandom;
  const { armarOpciones } = global.MathLock.Distractors;

  function rangoPorDificultad(dificultad) {
    // amplitud del rango de números según dificultad 1-5
    return [5, 10, 20, 50, 100][dificultad - 1] || 20;
  }

  function compare(rng, dificultad) {
    const r = rangoPorDificultad(dificultad);
    let a = randNonZeroInt(rng, -r, r);
    let b = randNonZeroInt(rng, -r, r);
    while (a === b) b = randNonZeroInt(rng, -r, r);
    const correcta = a < b ? '<' : '>';
    const opciones = ['<', '>', '='];
    return {
      question: `Compara: ${a} ___ ${b}`,
      correctAnswer: correcta,
      options: opciones,
      explanation: `En la recta numérica, ${a < b ? `${a} está a la izquierda de ${b}` : `${a} está a la derecha de ${b}`}, así que ${a} ${correcta} ${b}.`,
      metadata: { a, b }
    };
  }

  function addSub(rng, dificultad) {
    const r = rangoPorDificultad(dificultad);
    const a = randNonZeroInt(rng, -r, r);
    const b = randNonZeroInt(rng, -r, r);
    const op = pick(rng, ['+', '-']);
    const respuesta = op === '+' ? a + b : a - b;
    return {
      question: `${a} ${op} (${b})`,
      correctAnswer: respuesta,
      explanation: op === '+'
        ? `Sumar un negativo equivale a restar: ${a} + (${b}) = ${a} ${b < 0 ? '-' : '+'} ${Math.abs(b)} = ${respuesta}.`
        : `Restar un negativo equivale a sumar: ${a} - (${b}) = ${a} ${b < 0 ? '+' : '-'} ${Math.abs(b)} = ${respuesta}.`,
      metadata: { a, b, op }
    };
  }

  function mulDiv(rng, dificultad) {
    const maxFactor = [5, 8, 10, 12, 15][dificultad - 1] || 10;
    const op = pick(rng, ['x', '÷']);
    let a, b, respuesta;
    if (op === 'x') {
      a = randNonZeroInt(rng, -maxFactor, maxFactor);
      b = randNonZeroInt(rng, -maxFactor, maxFactor);
      respuesta = a * b;
    } else {
      b = randNonZeroInt(rng, -maxFactor, maxFactor);
      respuesta = randNonZeroInt(rng, -maxFactor, maxFactor);
      a = b * respuesta; // división exacta garantizada
    }
    const signoRegla = (a < 0) === (b < 0) ? 'positivo' : 'negativo';
    return {
      question: `${a} ${op} (${b})`,
      correctAnswer: respuesta,
      explanation: `Signos ${(a < 0) === (b < 0) ? 'iguales' : 'distintos'} → resultado ${signoRegla}. ${Math.abs(a)} ${op} ${Math.abs(b)} = ${Math.abs(respuesta)}, entonces el resultado es ${respuesta}.`,
      metadata: { a, b, op }
    };
  }

  function orderOfOperations(rng, dificultad) {
    const r = [5, 8, 10, 12, 15][dificultad - 1] || 10;
    // Construye a + b*c  ó  (a+b)*c - d, variando estructura por dificultad
    let expresionTexto, respuesta, a, b, c, d;
    const estructura = dificultad <= 2 ? 'simple' : pick(rng, ['con_parentesis', 'dos_operaciones']);

    if (estructura === 'simple') {
      a = randInt(rng, 1, r); b = randInt(rng, 1, r); c = randInt(rng, 2, 9);
      expresionTexto = `${a} + ${b} x ${c}`;
      respuesta = a + b * c;
    } else if (estructura === 'con_parentesis') {
      a = randInt(rng, 1, r); b = randInt(rng, 1, r); c = randInt(rng, 2, 9);
      expresionTexto = `(${a} + ${b}) x ${c}`;
      respuesta = (a + b) * c;
    } else {
      a = randInt(rng, 1, r); b = randInt(rng, 2, 9); c = randInt(rng, 1, r); d = randInt(rng, 2, 9);
      expresionTexto = `${a} x ${b} - ${c} x ${d}`;
      respuesta = a * b - c * d;
    }

    return {
      question: `Resuelve: ${expresionTexto}`,
      correctAnswer: respuesta,
      explanation: `Recuerda el orden: primero paréntesis, luego multiplicación/división, y al final suma/resta. ${expresionTexto} = ${respuesta}.`,
      metadata: { estructura }
    };
  }

  const BUILDERS = {
    'arithmetic.integers.compare': { fn: compare, type: 'multiple_choice' },
    'arithmetic.integers.add_sub': { fn: addSub, type: 'numeric' },
    'arithmetic.integers.mul_div': { fn: mulDiv, type: 'numeric' },
    'arithmetic.order_of_operations': { fn: orderOfOperations, type: 'numeric' },
  };

  function generar(skillId, rng, dificultad) {
    const builder = BUILDERS[skillId];
    if (!builder) return null;
    const base = builder.fn(rng, dificultad);
    const ex = {
      id: `${skillId}_${freshSeed()}`,
      skillId, type: builder.type, difficulty: dificultad,
      question: base.question, correctAnswer: base.correctAnswer,
      explanation: base.explanation, metadata: base.metadata || {},
      generatorVersion: '1.0'
    };
    if (builder.type === 'multiple_choice') {
      ex.options = base.options ? global.MathLock.SeededRandom.shuffle(rng, base.options) : armarOpciones(rng, base.correctAnswer, []);
    }
    return ex;
  }

  global.MathLock = global.MathLock || {};
  global.MathLock.Generators = global.MathLock.Generators || {};
  Object.keys(BUILDERS).forEach(id => { global.MathLock.Generators[id] = (rng, dificultad) => generar(id, rng, dificultad); });
})(window);
