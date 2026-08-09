// mastery.js
// Cada habilidad tiene un estado: { mastery, attempts, correct, incorrect,
// lastSeen, nextReview, streak, difficultyEstimate }. Una respuesta correcta
// en un ejercicio difícil aporta más que una fácil (spec del prompt).

(function (global) {
  'use strict';

  function estadoInicial() {
    return { mastery: 0, attempts: 0, correct: 0, incorrect: 0, lastSeen: null, nextReview: null, streak: 0, difficultyEstimate: 1 };
  }

  function clamp01(n) { return Math.max(0, Math.min(1, n)); }

  // Intervalos de repaso espaciado según el mastery alcanzado (en horas)
  function intervaloHoras(mastery) {
    if (mastery < 0.3) return 6;
    if (mastery < 0.5) return 24;
    if (mastery < 0.7) return 24 * 3;
    if (mastery < 0.85) return 24 * 7;
    return 24 * 14; // dominado: repasa cada 2 semanas, nunca desaparece del todo
  }

  function actualizar(estado, correcto, dificultad) {
    const s = estado ? { ...estado } : estadoInicial();
    s.attempts += 1;
    const ahora = Date.now();
    s.lastSeen = ahora;

    if (correcto) {
      s.correct += 1;
      s.streak = Math.max(0, s.streak) + 1;
      const delta = 0.06 + dificultad * 0.02; // acierto difícil vale más
      s.mastery = clamp01(s.mastery + delta);
    } else {
      s.incorrect += 1;
      s.streak = Math.min(0, s.streak) - 1;
      const delta = 0.08 + dificultad * 0.01;
      s.mastery = clamp01(s.mastery - delta);
    }

    // Ajustar la dificultad estimada para la próxima pregunta (staircase suave)
    if (correcto && s.streak >= 2) s.difficultyEstimate = Math.min(5, s.difficultyEstimate + 1);
    if (!correcto) s.difficultyEstimate = Math.max(1, s.difficultyEstimate - 1);

    s.nextReview = ahora + intervaloHoras(s.mastery) * 3600 * 1000;
    return s;
  }

  global.MathLock = global.MathLock || {};
  global.MathLock.Mastery = { estadoInicial, actualizar, intervaloHoras };
})(window);
