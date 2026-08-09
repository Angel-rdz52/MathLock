// generators/fractions.js — Etapa 2: Fracciones, decimales y porcentajes
(function (global) {
  'use strict';
  const { randInt, randNonZeroInt, pick, freshSeed } = global.MathLock.SeededRandom;
  const F = global.MathLock.FractionUtils;

  function fraccionAleatoria(rng, maxDen, permitirNegativo = true) {
    const den = randInt(rng, 2, maxDen);
    let num = randInt(rng, 1, maxDen);
    if (permitirNegativo && rng() < 0.3) num = -num;
    return { num, den };
  }

  function simplifyGen(rng, dificultad) {
    const maxDen = [8, 12, 16, 24, 36][dificultad - 1] || 12;
    // Construir una fracción NO simplificada a propósito (num y den comparten factor)
    const factor = randInt(rng, 2, dificultad + 2);
    const base = F.simplify(randInt(rng, 1, maxDen / factor || 6), randInt(rng, 2, maxDen / factor || 6));
    const num = base.num * factor, den = base.den * factor;
    const reducida = F.simplify(num, den);
    return {
      question: `Simplifica la fracción: ${num}/${den}`,
      correctAnswer: F.toStr(reducida),
      explanation: `El máximo común divisor de ${num} y ${den} es ${F.gcd(num, den)}. Divide ambos entre ese número: ${num}/${F.gcd(num, den)} sobre ${den}/${F.gcd(num, den)} = ${F.toStr(reducida)}.`,
      metadata: { num, den }
    };
  }

  function compareGen(rng, dificultad) {
    const maxDen = [6, 8, 10, 12, 15][dificultad - 1] || 8;
    const f1 = fraccionAleatoria(rng, maxDen, false);
    let f2 = fraccionAleatoria(rng, maxDen, false);
    let intentos = 0;
    while (F.compare(f1, f2) === '=' && intentos < 10) { f2 = fraccionAleatoria(rng, maxDen, false); intentos++; }
    const correcta = F.compare(f1, f2);
    return {
      question: `Compara: ${F.toStr(f1)} ___ ${F.toStr(f2)}`,
      correctAnswer: correcta,
      options: ['<', '>', '='],
      explanation: `Convirtiendo a común denominador: ${f1.num}x${f2.den}=${f1.num * f2.den} y ${f2.num}x${f1.den}=${f2.num * f1.den}, así que ${F.toStr(f1)} ${correcta} ${F.toStr(f2)}.`,
      metadata: { f1, f2 }
    };
  }

  function addSubGen(rng, dificultad) {
    const maxDen = [6, 8, 10, 12, 15][dificultad - 1] || 8;
    const mismoDenominador = dificultad <= 2;
    const den1 = randInt(rng, 2, maxDen);
    const f1 = { num: randNonZeroInt(rng, -maxDen, maxDen), den: den1 };
    const f2 = { num: randNonZeroInt(rng, -maxDen, maxDen), den: mismoDenominador ? den1 : randInt(rng, 2, maxDen) };
    const op = pick(rng, ['+', '-']);
    const resultado = op === '+' ? F.add(f1, f2) : F.sub(f1, f2);
    if (!resultado) return null;
    return {
      question: `${F.toStr(f1)} ${op} ${F.toStr(f2)}`,
      correctAnswer: F.toStr(resultado),
      explanation: `Busca común denominador (${f1.den * f2.den}), ajusta los numeradores y luego ${op === '+' ? 'suma' : 'resta'}. Resultado simplificado: ${F.toStr(resultado)}.`,
      metadata: { f1, f2, op }
    };
  }

  function mulDivGen(rng, dificultad) {
    const maxDen = [6, 8, 10, 12, 15][dificultad - 1] || 8;
    const f1 = fraccionAleatoria(rng, maxDen);
    let f2 = fraccionAleatoria(rng, maxDen);
    while (f2.num === 0) f2 = fraccionAleatoria(rng, maxDen);
    const op = pick(rng, ['x', '÷']);
    const resultado = op === 'x' ? F.mul(f1, f2) : F.div(f1, f2);
    if (!resultado) return null;
    return {
      question: `${F.toStr(f1)} ${op} ${F.toStr(f2)}`,
      correctAnswer: F.toStr(resultado),
      explanation: op === 'x'
        ? `Multiplica numerador por numerador y denominador por denominador: (${f1.num}x${f2.num})/(${f1.den}x${f2.den}) = ${F.toStr(resultado)}.`
        : `Dividir es multiplicar por el recíproco: ${F.toStr(f1)} x ${f2.den}/${f2.num} = ${F.toStr(resultado)}.`,
      metadata: { f1, f2, op }
    };
  }

  function toDecimalGen(rng, dificultad) {
    // Solo denominadores que dan decimal exacto (2,4,5,8,10,20,25,50)
    const dens = [2, 4, 5, 8, 10, 20, 25, 50];
    const den = pick(rng, dens.slice(0, Math.min(dens.length, 2 + dificultad)));
    const num = randInt(rng, 1, den * 3);
    const frac = F.simplify(num, den);
    const decimal = F.toDecimal(frac, 3).toString().replace(/0+$/, '').replace(/\.$/, '');
    return {
      question: `Escribe como decimal: ${F.toStr(frac)}`,
      correctAnswer: decimal,
      explanation: `Divide el numerador entre el denominador: ${frac.num} ÷ ${frac.den} = ${decimal}.`,
      metadata: { frac }
    };
  }

  function percentCalcGen(rng, dificultad) {
    const porcentajes = [10, 20, 25, 50, 5, 15, 30, 75, 40, 12][Math.min(9, dificultad + randInt(rng, 0, 4))] || 10;
    const base = randInt(rng, 2, [10, 20, 40, 80, 120][dificultad - 1] || 40) * (dificultad >= 4 ? 5 : 1);
    const respuesta = Math.round((porcentajes / 100) * base * 100) / 100;
    return {
      question: `¿Cuánto es el ${porcentajes}% de ${base}?`,
      correctAnswer: respuesta,
      explanation: `${porcentajes}% equivale a ${porcentajes}/100. Multiplica: ${base} x ${porcentajes}/100 = ${respuesta}.`,
      metadata: { porcentajes, base }
    };
  }

  function percentWordGen(rng, dificultad) {
    const precio = randInt(rng, 10, 20) * 10;
    const descuento = pick(rng, [10, 15, 20, 25, 30, 40, 50]);
    const modo = pick(rng, ['descuento', 'aumento']);
    const cambio = Math.round((descuento / 100) * precio);
    const resultado = modo === 'descuento' ? precio - cambio : precio + cambio;
    return {
      question: modo === 'descuento'
        ? `Un producto cuesta $${precio} y tiene ${descuento}% de descuento. ¿Cuál es el precio final?`
        : `Un producto cuesta $${precio} y su precio aumenta ${descuento}%. ¿Cuál es el nuevo precio?`,
      correctAnswer: resultado,
      explanation: `Calcula el ${descuento}% de $${precio} = $${cambio}, y luego ${modo === 'descuento' ? 'réstalo' : 'súmalo'} al precio original: $${precio} ${modo === 'descuento' ? '-' : '+'} $${cambio} = $${resultado}.`,
      metadata: { precio, descuento, modo }
    };
  }

  const BUILDERS = {
    'fractions.simplify': { fn: simplifyGen, type: 'fraction' },
    'fractions.compare': { fn: compareGen, type: 'multiple_choice' },
    'fractions.add_sub': { fn: addSubGen, type: 'fraction' },
    'fractions.mul_div': { fn: mulDivGen, type: 'fraction' },
    'fractions.to_decimal': { fn: toDecimalGen, type: 'numeric' },
    'percentages.calculate': { fn: percentCalcGen, type: 'numeric' },
    'percentages.word_problem': { fn: percentWordGen, type: 'numeric' },
  };

  function generar(skillId, rng, dificultad) {
    const builder = BUILDERS[skillId];
    if (!builder) return null;
    const base = builder.fn(rng, dificultad);
    if (!base) return null;
    const ex = {
      id: `${skillId}_${freshSeed()}`,
      skillId, type: builder.type, difficulty: dificultad,
      question: base.question, correctAnswer: base.correctAnswer,
      explanation: base.explanation, metadata: base.metadata || {},
      generatorVersion: '1.0'
    };
    if (builder.type === 'multiple_choice') {
      ex.options = base.options ? global.MathLock.SeededRandom.shuffle(rng, base.options) : [];
    }
    return ex;
  }

  global.MathLock = global.MathLock || {};
  global.MathLock.Generators = global.MathLock.Generators || {};
  Object.keys(BUILDERS).forEach(id => { global.MathLock.Generators[id] = (rng, dificultad) => generar(id, rng, dificultad); });
})(window);
