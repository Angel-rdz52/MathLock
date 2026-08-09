# MathLock → Android

App de práctica matemática adaptativa con bloqueo de apps: el estudiante
resuelve ejercicios generados localmente (sin depender de internet ni de
IA) para ganar tiempo de desbloqueo. Proyecto independiente — no depende
de LeeConmigo ni comparte datos con esa app.

## 🚀 ¿No tenés PC? Compilá el APK desde el celular con GitHub Actions

Este es el camino recomendado si solo tenés el celular: no instalás nada,
todo lo compila GitHub en la nube y vos solo descargás el APK terminado.

1. Creá un repositorio en GitHub (desde el navegador del celular, en
   github.com, botón "New repository").
2. Subí el contenido de esta carpeta (`mathlock-android/`) al repo. Más
   fácil: en la página del repo, "Add file → Upload files", arrastrá/elegí
   todos los archivos y carpetas de este zip, y confirmá el commit. GitHub
   preserva la estructura de carpetas al subir así.
3. Andá a la pestaña **Actions** del repo. Vas a ver el workflow
   "Build APK" ya detectado (viene incluido en `.github/workflows/build-apk.yml`).
   Si no arrancó solo, tocá **Run workflow**.
4. Esperá unos 5-8 minutos a que termine (ícono verde ✅).
5. Entrá a esa ejecución terminada, bajá hasta **Artifacts**, y descargá
   **MathLock-debug-apk** (te lo entrega como .zip conteniendo el .apk).
6. Ese archivo ya se descarga directo al celular. Abrilo desde tus
   Descargas, extraé el .apk del zip, tocalo para instalar (la primera vez
   Android te va a pedir permitir "orígenes desconocidos" para esa app —
   se activa una vez).

Cada vez que quieras un APK nuevo (por ejemplo si agregás una etapa nueva
del currículum), solo tenés que subir los archivos modificados al repo (o
commitear desde Codespaces, ver abajo) y el workflow se vuelve a correr solo.

Este workflow arma el proyecto Android **desde cero en cada corrida**
(`npx cap add android` + el script `scripts/setup-android.sh`, que copia el
plugin nativo y parchea el Manifest/MainActivity automáticamente) — así que
no hace falta que vos generes ni edites la carpeta `android/` a mano.

> Nota: genera un **APK de debug**, perfecto para instalar y probar. Si más
> adelante querés un APK "release" firmado, avisame y agregamos el paso de
> firma con un keystore guardado como *secret* del repo.

## 🖥️ Alternativa: GitHub Codespaces (VS Code en el navegador)

1. En la página del repo en GitHub: botón verde **Code → Codespaces →
   Create codespace on main**.
2. Se incluye un `.devcontainer/devcontainer.json` que intenta instalar
   Java + Node + Android SDK automáticamente. Si el SDK no quedó instalado:
   ```bash
   bash scripts/install-android-sdk.sh
   source ~/.bashrc
   ```
3. Después, en la terminal del Codespace:
   ```bash
   npm install
   npx cap add android
   npx cap sync android
   bash scripts/setup-android.sh
   cd android
   ./gradlew assembleDebug
   ```
4. El APK queda en `android/app/build/outputs/apk/debug/app-debug.apk`.
   Click derecho en el explorador de archivos → **Download**.

## Qué trae este paquete
- `www/` → la app (index.html, app.js, style.css) y el motor de matemáticas
  completo en `www/math/` (currículum, habilidades, generadores, mastery,
  repaso espaciado, diagnóstico) — todo corre local, sin red.
- `www/app-blocker.js` / `www/parental.js` → puente con el plugin nativo y
  panel de control parental (reutilizados sin cambios funcionales desde el
  proyecto hermano LeeConmigo, son genéricos).
- `native-plugin/android/` → el plugin nativo en Kotlin que detecta y
  bloquea apps (paquete `com.mathlock.app`).
- `.github/workflows/build-apk.yml` + `scripts/` → compilan el APK
  automáticamente y parchean Manifest/MainActivity.

## Configurar el control parental (dentro de la app, ya instalada)
1. La primera vez que se abre la app, MathLock te lleva directo a
   "🔒 Control parental" (todavía no hay perfil de estudiante creado).
2. El primer PIN que escribas queda guardado como PIN del adulto.
3. Concedé los permisos que pida (Acceso a datos de uso, Mostrar sobre
   otras apps) y marcá qué apps se bloquean.
4. Guardá cambios — volvés al login, donde el estudiante crea su perfil
   y elige "Diagnóstico rápido" o "Empezar desde cero".

## Etapas del currículum ya implementadas (con generación local)
1. Números y operaciones (enteros, jerarquía de operaciones)
2. Fracciones, decimales y porcentajes
3. Lenguaje algebraico (simplificar, distributiva, evaluar)
4. Ecuaciones lineales (un paso, dos pasos, incógnita en ambos lados)

Las etapas 5-14 (geometría, estadística, probabilidad, sistemas de
ecuaciones, etc.) están definidas en `www/math/curriculum.js` como hoja de
ruta, listas para sumarles generadores en las próximas fases.

## Limitaciones honestas (heredadas del mecanismo de bloqueo)
- El servicio revisa la app en primer plano cada ~1.5s: hay un instante
  breve donde la app bloqueada se alcanza a ver antes del bloqueo.
- Algunos fabricantes (Xiaomi, Huawei, algunos Samsung) matan servicios en
  segundo plano agresivamente — puede hacer falta desactivar la
  optimización de batería para MathLock manualmente.
- No es un "Device Owner" con control total: un estudiante con
  conocimientos técnicos podría eludirlo desinstalando la app.
