// fraction-utils.js
// Aritmética exacta de fracciones con enteros (sin errores de punto flotante).
(function (global) {
  'use strict';

  function gcd(a, b) {
    a = Math.abs(a); b = Math.abs(b);
    while (b) { [a, b] = [b, a % b]; }
    return a || 1;
  }

  function simplify(num, den) {
    if (den === 0) return null; // inválida
    if (den < 0) { num = -num; den = -den; }
    const g = gcd(num, den);
    return { num: num / g, den: den / g };
  }

  function toStr(frac) {
    if (frac.den === 1) return `${frac.num}`;
    return `${frac.num}/${frac.den}`;
  }

  function add(f1, f2) {
    return simplify(f1.num * f2.den + f2.num * f1.den, f1.den * f2.den);
  }

  function sub(f1, f2) {
    return simplify(f1.num * f2.den - f2.num * f1.den, f1.den * f2.den);
  }

  function mul(f1, f2) {
    return simplify(f1.num * f2.num, f1.den * f2.den);
  }

  function div(f1, f2) {
    if (f2.num === 0) return null;
    return simplify(f1.num * f2.den, f1.den * f2.num);
  }

  function toDecimal(frac, decimales = 2) {
    return Number((frac.num / frac.den).toFixed(decimales));
  }

  function compare(f1, f2) {
    const izq = f1.num * f2.den;
    const der = f2.num * f1.den;
    if (izq < der) return '<';
    if (izq > der) return '>';
    return '=';
  }

  global.MathLock = global.MathLock || {};
  global.MathLock.FractionUtils = { gcd, simplify, toStr, add, sub, mul, div, toDecimal, compare };
})(window);
