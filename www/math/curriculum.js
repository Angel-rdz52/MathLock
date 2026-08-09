// curriculum.js
// Mapa completo de las 14 etapas de MathLock. Cada etapa referencia los
// skillIds definidos en skills.js. Las etapas marcadas con implemented:true
// ya tienen generadores locales funcionando (ver /math/generators). Las
// demás quedan definidas como hoja de ruta (roadmap) para próximas fases:
// la UI las puede mostrar como "próximamente" sin romper nada.

(function (global) {
  'use strict';

  const ETAPAS = [
    {
      id: 'etapa1', numero: 1, nombre: 'Números y operaciones', implemented: true,
      skills: ['arithmetic.integers.compare', 'arithmetic.integers.add_sub', 'arithmetic.integers.mul_div', 'arithmetic.order_of_operations']
    },
    {
      id: 'etapa2', numero: 2, nombre: 'Fracciones, decimales y porcentajes', implemented: true,
      skills: ['fractions.simplify', 'fractions.compare', 'fractions.add_sub', 'fractions.mul_div', 'fractions.to_decimal', 'percentages.calculate', 'percentages.word_problem']
    },
    {
      id: 'etapa3', numero: 3, nombre: 'Lenguaje algebraico', implemented: true,
      skills: ['algebra.simplify', 'algebra.distributive', 'algebra.evaluate']
    },
    {
      id: 'etapa4', numero: 4, nombre: 'Ecuaciones e inecuaciones', implemented: true,
      skills: ['equations.one_step', 'equations.two_step', 'equations.both_sides']
    },
    { id: 'etapa5', numero: 5, nombre: 'Proporcionalidad y relaciones lineales', implemented: false, skills: [] },
    { id: 'etapa6', numero: 6, nombre: 'Geometría fundamental', implemented: false, skills: [] },
    { id: 'etapa7', numero: 7, nombre: 'Medición, perímetro, área y círculos', implemented: false, skills: [] },
    { id: 'etapa8', numero: 8, nombre: 'Estadística', implemented: false, skills: [] },
    { id: 'etapa9', numero: 9, nombre: 'Probabilidad y conteo', implemented: false, skills: [] },
    { id: 'etapa10', numero: 10, nombre: 'Construcciones geométricas', implemented: false, skills: [] },
    { id: 'etapa11', numero: 11, nombre: 'Sistemas de ecuaciones', implemented: false, skills: [] },
    { id: 'etapa12', numero: 12, nombre: 'Exponentes y expresiones cuadráticas', implemented: false, skills: [] },
    { id: 'etapa13', numero: 13, nombre: 'Proporcionalidad inversa, escalas y figuras compuestas', implemented: false, skills: [] },
    { id: 'etapa14', numero: 14, nombre: 'Sucesiones y problemas integradores', implemented: false, skills: [] },
  ];

  function getEtapaDeSkill(skillId) {
    return ETAPAS.find(e => e.skills.includes(skillId)) || null;
  }

  global.MathLock = global.MathLock || {};
  global.MathLock.Curriculum = { ETAPAS, getEtapaDeSkill };
})(window);
