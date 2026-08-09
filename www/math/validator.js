// validator.js
// Última línea de defensa antes de mostrar un ejercicio: si algo no
// cuadra, el motor descarta el ejercicio y genera otro (ver engine.js).

(function (global) {
  'use strict';

  function validar(ex) {
    if (!ex) return false;
    if (!ex.id || !ex.skillId || !ex.question || ex.correctAnswer === undefined || ex.correctAnswer === null || ex.correctAnswer === '') return false;
    if (!Number.isFinite(ex.difficulty) || ex.difficulty < 1 || ex.difficulty > 5) return false;

    if (ex.type === 'multiple_choice') {
      if (!Array.isArray(ex.options) || ex.options.length < 3) return false;
      const set = new Set(ex.options);
      if (set.size !== ex.options.length) return false; // opciones duplicadas
      if (!ex.options.includes(String(ex.correctAnswer))) return false;
    }

    if (ex.type === 'numeric') {
      const n = Number(ex.correctAnswer);
      if (!Number.isFinite(n)) return false;
    }

    if (ex.type === 'fraction') {
      if (!/^-?\d+(\/\d+)?$/.test(String(ex.correctAnswer))) return false;
      // denominador no cero
      const partes = String(ex.correctAnswer).split('/');
      if (partes[1] === '0') return false;
    }

    return true;
  }

  global.MathLock = global.MathLock || {};
  global.MathLock.Validator = { validar };
})(window);
