// seeded-random.js
// Generador pseudoaleatorio determinista (mulberry32). Permite reproducir,
// depurar y evitar duplicados exactos guardando solo el seed usado.
(function (global) {
  'use strict';

  function make(seed) {
    let a = (seed >>> 0) || 1;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function freshSeed() {
    return (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0;
  }

  function randInt(rng, min, max) {
    return Math.floor(rng() * (max - min + 1)) + min;
  }

  function randNonZeroInt(rng, min, max) {
    let v = 0;
    while (v === 0) v = randInt(rng, min, max);
    return v;
  }

  function pick(rng, arr) {
    return arr[Math.floor(rng() * arr.length)];
  }

  function shuffle(rng, arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  global.MathLock = global.MathLock || {};
  global.MathLock.SeededRandom = { make, freshSeed, randInt, randNonZeroInt, pick, shuffle };
})(window);
