// app.js — MathLock
// Orquesta: login local -> (diagnóstico opcional) -> ruta de aprendizaje ->
// sesión de práctica (motor local, sin red) -> puntos -> canje/bloqueo
// (reutiliza app-blocker.js + parental.js sin modificarlos).

const USER_KEY = 'mathlock_user_local';

let currentUser = null;
let diagSesion = null;
let leccion = { preguntas: [], indice: 0, correctas: 0, skillIdActual: null };

const screens = {
    login: document.getElementById('screen-login'),
    startChoice: document.getElementById('screen-start-choice'),
    diagnostic: document.getElementById('screen-diagnostic'),
    diagnosticResult: document.getElementById('screen-diagnostic-result'),
    dashboard: document.getElementById('screen-path'),
    lesson: document.getElementById('screen-lesson'),
    results: document.getElementById('screen-results'),
    redeem: document.getElementById('screen-redeem'),
    adminPin: document.getElementById('screen-admin-pin'),
    admin: document.getElementById('screen-admin'),
};

// Contrato esperado por parental.js (no se modifica ese archivo).
window.LC = {
    getUser: () => currentUser,
    saveUser: () => localStorage.setItem(USER_KEY, JSON.stringify(currentUser)),
    showScreen,
    refreshDashboard: () => renderPath(),
};

function showScreen(name) {
    Object.values(screens).forEach(s => { if (s) { s.classList.remove('screen-active'); s.classList.add('screen-hidden'); } });
    if (screens[name]) { screens[name].classList.remove('screen-hidden'); screens[name].classList.add('screen-active'); }
}

function nuevoUsuario(nombre) {
    return { name: nombre, total_stars: 0, streak: 0, masteryMap: {} };
}

/* ============== LOGIN ============== */

// parental.js corre su propio DOMContentLoaded ANTES que este (se carga
// primero en index.html) y, si todavía no hay PIN de control parental
// configurado, fuerza la pantalla de "Control parental" — es la primera
// vez que se abre la app. En ese caso NO auto-navegamos a "dashboard" acá
// abajo aunque exista un usuario guardado, para no taparle esa pantalla.
const PIN_KEY_COMPARTIDA = 'lc_admin_pin'; // misma clave que usa parental.js

window.addEventListener('DOMContentLoaded', () => {
    const guardado = localStorage.getItem(USER_KEY);
    const yaConfiguradoElAdulto = !!localStorage.getItem(PIN_KEY_COMPARTIDA);
    if (guardado && yaConfiguradoElAdulto) {
        currentUser = JSON.parse(guardado);
        if (!currentUser.masteryMap) currentUser.masteryMap = {};
        renderPath();
        showScreen('dashboard');
    }
    // Si no hay PIN todavía, no tocamos la pantalla: parental.js ya mostró
    // "screen-admin-pin" para que el adulto configure el bloqueo primero.
    // Cuando termine, su propio código decide a dónde ir (login o dashboard).
});

document.getElementById('btn-start').addEventListener('click', () => {
    const nombre = document.getElementById('input-name').value.trim();
    if (!nombre) return;
    currentUser = nuevoUsuario(nombre);
    LC.saveUser();
    showScreen('startChoice');
});

document.getElementById('btn-choice-scratch').addEventListener('click', () => {
    renderPath();
    showScreen('dashboard');
});

document.getElementById('btn-choice-diagnostic').addEventListener('click', () => {
    diagSesion = MathLock.Diagnostic.crearSesion();
    renderDiagQuestion();
    showScreen('diagnostic');
});

/* ============== DIAGNÓSTICO ============== */

function renderDiagQuestion() {
    const q = MathLock.Diagnostic.siguientePregunta(diagSesion);
    if (!q) return finalizarDiagnostico();
    document.getElementById('diag-progress').textContent = `${diagSesion.preguntasHechas + 1} / ~24`;
    const qEl = document.getElementById('diag-question');
    qEl.textContent = q.question;
    qEl.classList.remove('is-correct');
    renderAreaRespuesta('diag-answer-area', q);
}

document.getElementById('btn-diag-submit').addEventListener('click', () => {
    const q = diagSesion.preguntaActual;
    if (!q) return;
    const correcto = evaluarRespuesta(q, leerRespuestaUsuario('diag-answer-area', q));
    MathLock.Diagnostic.registrarRespuesta(diagSesion, correcto);
    if (MathLock.Diagnostic.estaCompleto(diagSesion)) finalizarDiagnostico();
    else renderDiagQuestion();
});

function finalizarDiagnostico() {
    const resultado = MathLock.Diagnostic.resultadoFinal(diagSesion);
    currentUser.masteryMap = resultado.masteryMap;
    LC.saveUser();

    const etapa = MathLock.Curriculum.ETAPAS.find(e => e.id === resultado.etapaRecomendada);
    document.getElementById('diag-etapa-recomendada').textContent = etapa ? `Etapa ${etapa.numero} — ${etapa.nombre}` : '—';

    const nombresFortalezas = resultado.fortalezas.map(id => MathLock.Skills.SKILLS[id]?.name).filter(Boolean);
    const nombresDebilidades = resultado.debilidades.map(id => MathLock.Skills.SKILLS[id]?.name).filter(Boolean);
    document.getElementById('diag-fortalezas').innerHTML = nombresFortalezas.length
        ? nombresFortalezas.map(n => `<span class="px-2 py-1 rounded-full" style="background:var(--teal-dim); color:var(--teal)">${n}</span>`).join('')
        : '<span style="color:var(--chalk-dim)">Ninguna todavía — ¡vamos a construirlas!</span>';
    document.getElementById('diag-debilidades').innerHTML = nombresDebilidades.length
        ? nombresDebilidades.map(n => `<span class="px-2 py-1 rounded-full" style="background:var(--amber-dim); color:var(--amber)">${n}</span>`).join('')
        : '<span style="color:var(--chalk-dim)">Ninguna 🎉</span>';

    showScreen('diagnosticResult');
}

document.getElementById('btn-diag-continue').addEventListener('click', () => {
    renderPath();
    showScreen('dashboard');
});

/* ============== RUTA DE APRENDIZAJE ============== */

function estadoDeSkill(skillId) {
    const m = currentUser.masteryMap[skillId];
    const umbral = MathLock.Skills.SKILLS[skillId].masteryThreshold;
    if (!m || m.attempts === 0) {
        return MathLock.Skills.prerequisitosCumplidos(skillId, currentUser.masteryMap) ? 'disponible' : 'bloqueada';
    }
    if (m.mastery >= umbral) {
        return (m.nextReview && m.nextReview <= Date.now()) ? 'requiere-repaso' : 'dominada';
    }
    return 'en-progreso';
}

const ICONO_ESTADO = { bloqueada: '🔒', disponible: '○', 'en-progreso': '●', dominada: '✓', 'requiere-repaso': '↻' };

function renderPath() {
    document.getElementById('path-name').textContent = `Hola, ${currentUser.name}`;
    document.getElementById('path-points').textContent = currentUser.total_stars || 0;

    const rachaVisible = Math.min(10, currentUser.streak || 0);
    document.getElementById('path-tally').innerHTML = Array.from({ length: rachaVisible }, () => '<span class="tally-mark"></span>').join('');

    const proxima = MathLock.Scheduler.proximaHabilidad(currentUser.masteryMap);
    const etapaActual = proxima ? MathLock.Curriculum.getEtapaDeSkill(proxima) : null;
    document.getElementById('path-etapa').textContent = etapaActual
        ? `Etapa ${etapaActual.numero} — ${etapaActual.nombre}`
        : '¡Currículum implementado completado! 🎉';

    const cont = document.getElementById('skill-path-list');
    cont.innerHTML = '';
    MathLock.Curriculum.ETAPAS.forEach(etapa => {
        const bloque = document.createElement('div');
        bloque.className = 'mb-4';
        const titulo = document.createElement('p');
        titulo.className = 'text-xs font-bold mb-2';
        titulo.style.color = etapa.implemented ? 'var(--chalk-dim)' : 'var(--locked)';
        titulo.textContent = `Etapa ${etapa.numero} — ${etapa.nombre}${etapa.implemented ? '' : ' (próximamente)'}`;
        bloque.appendChild(titulo);

        if (etapa.implemented) {
            etapa.skills.forEach((skillId, i) => {
                const fila = document.createElement('div');
                fila.className = 'flex items-center gap-3 mb-1';
                const estado = estadoDeSkill(skillId);
                fila.innerHTML = `<span class="skill-node ${estado}">${ICONO_ESTADO[estado]}</span>
                    <span class="text-sm" style="color:var(--chalk)">${MathLock.Skills.SKILLS[skillId].name}</span>`;
                bloque.appendChild(fila);
            });
        }
        cont.appendChild(bloque);
    });
}

document.getElementById('btn-start-session').addEventListener('click', () => {
    const plan = MathLock.Scheduler.planRepasoDiario(currentUser.masteryMap);
    const preguntas = MathLock.Engine.generateMixedSession(plan.length ? plan : [{ skillId: 'arithmetic.integers.add_sub', dificultad: 1, cantidad: 6 }]);
    leccion = { preguntas, indice: 0, correctas: 0 };
    renderLessonQuestion();
    showScreen('lesson');
});

/* ============== LECCIÓN / PRÁCTICA ============== */

function renderLessonQuestion() {
    const q = leccion.preguntas[leccion.indice];
    document.getElementById('lesson-skill-name').textContent = MathLock.Skills.SKILLS[q.skillId]?.name || '';
    document.getElementById('lesson-progress').textContent = `${leccion.indice + 1} / ${leccion.preguntas.length}`;
    const qEl = document.getElementById('lesson-question');
    qEl.textContent = q.question;
    qEl.classList.remove('is-correct');
    document.getElementById('lesson-feedback').classList.add('hidden');
    document.getElementById('btn-lesson-submit').classList.remove('hidden');
    renderAreaRespuesta('lesson-answer-area', q);
}

function renderAreaRespuesta(contId, q) {
    const cont = document.getElementById(contId);
    cont.innerHTML = '';
    if (q.type === 'multiple_choice') {
        q.options.forEach(op => {
            const btn = document.createElement('button');
            btn.className = 'option-btn font-mono';
            btn.textContent = op;
            btn.dataset.value = op;
            btn.addEventListener('click', () => {
                cont.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                cont.dataset.selected = op;
            });
            cont.appendChild(btn);
        });
    } else {
        const input = document.createElement('input');
        input.type = q.type === 'numeric' ? 'text' : 'text';
        input.inputMode = q.type === 'numeric' ? 'decimal' : 'text';
        input.className = 'answer-input w-full';
        input.id = `${contId}-input`;
        input.placeholder = q.type === 'fraction' ? 'ej. 3/4' : 'tu respuesta';
        cont.appendChild(input);
        setTimeout(() => input.focus(), 50);
    }
}

function leerRespuestaUsuario(contId, q) {
    if (q.type === 'multiple_choice') return document.getElementById(contId).dataset.selected || '';
    const input = document.getElementById(`${contId}-input`);
    return input ? input.value.trim() : '';
}

function evaluarRespuesta(q, respuestaUsuario) {
    if (respuestaUsuario === '' || respuestaUsuario == null) return false;
    if (q.type === 'numeric') {
        const a = Number(respuestaUsuario.replace(',', '.'));
        const b = Number(q.correctAnswer);
        return Number.isFinite(a) && Math.abs(a - b) < 0.01;
    }
    if (q.type === 'fraction') {
        return evaluarFraccion(q, respuestaUsuario);
    }
    return String(respuestaUsuario) === String(q.correctAnswer);
}

function evaluarFraccion(q, respuestaUsuario) {
    const F = MathLock.FractionUtils;
    const limpio = respuestaUsuario.replace(/\s+/g, '');
    if (q.skillId === 'fractions.simplify') {
        return limpio === String(q.correctAnswer); // exige la forma ya simplificada
    }
    // Para el resto, se acepta cualquier forma equivalente (se reduce antes de comparar).
    let frac;
    if (limpio.includes('/')) {
        const [n, d] = limpio.split('/').map(Number);
        if (!Number.isFinite(n) || !Number.isFinite(d) || d === 0) return false;
        frac = F.simplify(n, d);
    } else {
        const n = Number(limpio);
        if (!Number.isFinite(n)) return false;
        frac = { num: n, den: 1 };
    }
    return F.toStr(frac) === String(q.correctAnswer);
}

document.getElementById('btn-lesson-submit').addEventListener('click', () => {
    const q = leccion.preguntas[leccion.indice];
    const respuesta = leerRespuestaUsuario('lesson-answer-area', q);
    const correcto = evaluarRespuesta(q, respuesta);

    const prevMastery = currentUser.masteryMap[q.skillId];
    currentUser.masteryMap[q.skillId] = MathLock.Mastery.actualizar(prevMastery, correcto, q.difficulty);
    currentUser.streak = correcto ? (currentUser.streak || 0) + 1 : 0;
    if (correcto) {
        leccion.correctas += 1;
        currentUser.total_stars = (currentUser.total_stars || 0) + (2 + q.difficulty);
        document.getElementById('lesson-question').classList.add('is-correct');
    }
    LC.saveUser();

    // feedback visual en opción múltiple
    if (q.type === 'multiple_choice') {
        const cont = document.getElementById('lesson-answer-area');
        cont.querySelectorAll('.option-btn').forEach(b => {
            if (b.dataset.value === String(q.correctAnswer)) b.classList.add('correct');
            else if (b.classList.contains('selected')) b.classList.add('incorrect');
        });
    }

    const feedback = document.getElementById('lesson-feedback');
    feedback.classList.remove('hidden');
    feedback.style.color = correcto ? 'var(--teal)' : 'var(--coral)';
    feedback.textContent = (correcto ? '✓ ¡Correcto! ' : `✗ La respuesta era ${q.correctAnswer}. `) + q.explanation;
    document.getElementById('btn-lesson-submit').classList.add('hidden');

    setTimeout(() => {
        leccion.indice += 1;
        if (leccion.indice >= leccion.preguntas.length) {
            mostrarResultados();
        } else {
            renderLessonQuestion();
        }
    }, correcto ? 1400 : 2600);
});

function mostrarResultados() {
    document.getElementById('result-correct').textContent = leccion.correctas;
    document.getElementById('result-total').textContent = leccion.preguntas.length;
    const puntosGanados = leccion.preguntas.slice(0, leccion.correctas).length; // aprox. visual; el total real ya se sumó por pregunta
    document.getElementById('result-points-msg').textContent = `Puntos totales: ${currentUser.total_stars}`;
    showScreen('results');
}

document.getElementById('btn-results-home').addEventListener('click', () => {
    renderPath();
    showScreen('dashboard');
});

/* Nota: btn-admin-back, btn-redeem-back, btn-open-redeem, btn-open-admin,
   btn-admin-pin-cancel/submit ya registran sus listeners dentro de
   parental.js (reutilizado tal cual) — no se duplican aquí. */
