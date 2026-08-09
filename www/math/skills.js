// skills.js
// Cada habilidad es la unidad mínima de práctica y de mastery (0.0-1.0).
// `type` determina cómo se renderiza la respuesta en la UI:
//   'numeric'        -> input numérico libre
//   'fraction'       -> input tipo num/den
//   'multiple_choice'-> opciones (usa distractors.js)

(function (global) {
  'use strict';

  const SKILLS = {
    'arithmetic.integers.compare': {
      id: 'arithmetic.integers.compare', name: 'Comparar enteros', stage: 'etapa1',
      category: 'numeros', prerequisites: [], difficultyRange: [1, 3],
      masteryThreshold: 0.8, type: 'multiple_choice'
    },
    'arithmetic.integers.add_sub': {
      id: 'arithmetic.integers.add_sub', name: 'Suma y resta con negativos', stage: 'etapa1',
      category: 'numeros', prerequisites: ['arithmetic.integers.compare'], difficultyRange: [1, 5],
      masteryThreshold: 0.8, type: 'numeric'
    },
    'arithmetic.integers.mul_div': {
      id: 'arithmetic.integers.mul_div', name: 'Multiplicación y división con signos', stage: 'etapa1',
      category: 'numeros', prerequisites: ['arithmetic.integers.add_sub'], difficultyRange: [1, 5],
      masteryThreshold: 0.8, type: 'numeric'
    },
    'arithmetic.order_of_operations': {
      id: 'arithmetic.order_of_operations', name: 'Jerarquía de operaciones', stage: 'etapa1',
      category: 'numeros', prerequisites: ['arithmetic.integers.mul_div'], difficultyRange: [1, 5],
      masteryThreshold: 0.8, type: 'numeric'
    },

    'fractions.simplify': {
      id: 'fractions.simplify', name: 'Simplificar fracciones', stage: 'etapa2',
      category: 'fracciones', prerequisites: ['arithmetic.order_of_operations'], difficultyRange: [1, 5],
      masteryThreshold: 0.8, type: 'fraction'
    },
    'fractions.compare': {
      id: 'fractions.compare', name: 'Comparar fracciones', stage: 'etapa2',
      category: 'fracciones', prerequisites: ['fractions.simplify'], difficultyRange: [1, 4],
      masteryThreshold: 0.8, type: 'multiple_choice'
    },
    'fractions.add_sub': {
      id: 'fractions.add_sub', name: 'Suma y resta de fracciones', stage: 'etapa2',
      category: 'fracciones', prerequisites: ['fractions.compare'], difficultyRange: [1, 5],
      masteryThreshold: 0.8, type: 'fraction'
    },
    'fractions.mul_div': {
      id: 'fractions.mul_div', name: 'Multiplicación y división de fracciones', stage: 'etapa2',
      category: 'fracciones', prerequisites: ['fractions.add_sub'], difficultyRange: [1, 5],
      masteryThreshold: 0.8, type: 'fraction'
    },
    'fractions.to_decimal': {
      id: 'fractions.to_decimal', name: 'Fracción a decimal', stage: 'etapa2',
      category: 'fracciones', prerequisites: ['fractions.simplify'], difficultyRange: [1, 3],
      masteryThreshold: 0.8, type: 'numeric'
    },
    'percentages.calculate': {
      id: 'percentages.calculate', name: 'Calcular porcentajes', stage: 'etapa2',
      category: 'porcentajes', prerequisites: ['fractions.to_decimal'], difficultyRange: [1, 5],
      masteryThreshold: 0.8, type: 'numeric'
    },
    'percentages.word_problem': {
      id: 'percentages.word_problem', name: 'Problemas con porcentajes', stage: 'etapa2',
      category: 'porcentajes', prerequisites: ['percentages.calculate'], difficultyRange: [2, 5],
      masteryThreshold: 0.8, type: 'numeric'
    },

    'algebra.simplify': {
      id: 'algebra.simplify', name: 'Simplificar expresiones algebraicas', stage: 'etapa3',
      category: 'algebra', prerequisites: ['arithmetic.order_of_operations'], difficultyRange: [1, 5],
      masteryThreshold: 0.8, type: 'multiple_choice'
    },
    'algebra.distributive': {
      id: 'algebra.distributive', name: 'Propiedad distributiva', stage: 'etapa3',
      category: 'algebra', prerequisites: ['algebra.simplify'], difficultyRange: [1, 5],
      masteryThreshold: 0.8, type: 'multiple_choice'
    },
    'algebra.evaluate': {
      id: 'algebra.evaluate', name: 'Evaluar expresiones', stage: 'etapa3',
      category: 'algebra', prerequisites: ['algebra.simplify'], difficultyRange: [1, 5],
      masteryThreshold: 0.8, type: 'numeric'
    },

    'equations.one_step': {
      id: 'equations.one_step', name: 'Ecuaciones de un paso', stage: 'etapa4',
      category: 'ecuaciones', prerequisites: ['algebra.evaluate'], difficultyRange: [1, 3],
      masteryThreshold: 0.8, type: 'numeric'
    },
    'equations.two_step': {
      id: 'equations.two_step', name: 'Ecuaciones de dos pasos', stage: 'etapa4',
      category: 'ecuaciones', prerequisites: ['equations.one_step'], difficultyRange: [1, 5],
      masteryThreshold: 0.8, type: 'numeric'
    },
    'equations.both_sides': {
      id: 'equations.both_sides', name: 'Ecuaciones con incógnita en ambos lados', stage: 'etapa4',
      category: 'ecuaciones', prerequisites: ['equations.two_step'], difficultyRange: [2, 5],
      masteryThreshold: 0.8, type: 'numeric'
    },
  };

  function prerequisitosCumplidos(skillId, masteryMap) {
    const skill = SKILLS[skillId];
    if (!skill) return false;
    return skill.prerequisites.every(pid => (masteryMap[pid]?.mastery || 0) >= (SKILLS[pid]?.masteryThreshold || 0.8) * 0.7);
    // Nota: se exige el 70% del umbral del prerrequisito (no el 100%) para no
    // bloquear el avance de forma demasiado rígida; el scheduler igual
    // seguirá reforzando el prerrequisito si su mastery es bajo.
  }

  global.MathLock = global.MathLock || {};
  global.MathLock.Skills = { SKILLS, prerequisitosCumplidos };
})(window);
