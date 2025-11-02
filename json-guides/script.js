/* ==========================================================
   Editor de Preguntas - MathLock
   ----------------------------------------------------------
   Este script permite crear, visualizar y subir preguntas 
   (tipo test o abiertas) en formato JSON a GitHub Gist.
   ========================================================== */

/* ------------------------
   VARIABLES GLOBALES
--------------------------- */

// Array donde se almacenan todas las preguntas creadas
let questions = [];


/* ==========================================================
   FUNCIÓN: typeQuestion()
   ----------------------------------------------------------
   Se ejecuta cuando el usuario cambia el tipo de pregunta.
   Si el tipo es "abierta", oculta las opciones de múltiple
   elección y muestra el campo de respuesta abierta.
   Elementos involucrados:
     - select#type
     - div#options-container
     - div#open-answer-container
   ========================================================== */
function typeQuestion() {
  const type = document.getElementById("type").value;
  const optionsContainer = document.getElementById("options-container");
  const openAnswer = document.getElementById("open-answer-container");

  if (type === "abierta") {
    optionsContainer.classList.add("hidden");
    openAnswer.classList.remove("hidden");
  } else {
    optionsContainer.classList.remove("hidden");
    openAnswer.classList.add("hidden");
  }
}


/* ==========================================================
   FUNCIÓN: saveQuestion()
   ----------------------------------------------------------
   Guarda una pregunta en el array "questions".
   Valida los campos según el tipo de pregunta.
   Luego actualiza la vista previa del JSON en pantalla.
   Elementos involucrados:
     - textarea#question
     - select#difficulty
     - select#type
     - input#json-name
     - div#options-container
     - input#open-answer
     - pre#json-preview
   ========================================================== */
function saveQuestion() {
  const questionText = document.getElementById("question").value.trim();
  const difficulty = document.getElementById("difficulty").value;
  const type = document.getElementById("type").value;
  const jsonName = document.getElementById("json-name").value.trim();
  const preview = document.getElementById("json-preview");

  if (!jsonName) return alert("⚠️ Escribe un nombre para el archivo JSON.");
  if (!questionText) return alert("⚠️ Escribe la pregunta antes de guardar.");

  // Objeto base de la pregunta
  let newQuestion = { 
    pregunta: questionText, 
    dificultad: difficulty, 
    tipo: type 
  };

  if (type === "multiple") {
    // Recolectar opciones
    const options = [...document.querySelectorAll("#options-container .option input[type='text']")]
                    .map(o => o.value.trim());
    const correct = document.querySelector("#options-container input[type='radio']:checked");

    if (!correct) return alert("⚠️ Selecciona la opción correcta.");
    if (options.some(opt => !opt)) return alert("⚠️ Completa todas las opciones.");

    newQuestion.opciones = options;
    newQuestion.correcta = options[parseInt(correct.value)];

  } else {
    // Recolectar respuesta abierta
    const answer = document.getElementById("open-answer").value.trim();
    if (!answer) return alert("⚠️ Escribe la respuesta esperada.");
    newQuestion.respuesta = answer;
  }

  // Agregar la pregunta al arreglo global
  questions.push(newQuestion);

  // Actualizar vista previa
  preview.textContent = JSON.stringify(questions, null, 2);

  alert("✅ Pregunta guardada correctamente.");
}


/* ==========================================================
   FUNCIÓN: clearForm()
   ----------------------------------------------------------
   Limpia todos los campos del formulario para ingresar
   una nueva pregunta sin eliminar las preguntas ya guardadas.
   Elementos involucrados:
     - textarea#question
     - input#open-answer
     - inputs dentro de #options-container
   ========================================================== */
function clearForm() {
  document.getElementById("question").value = "";
  document.getElementById("open-answer").value = "";
  document.querySelectorAll("#options-container input[type='text']").forEach(o => o.value = "");
  document.querySelectorAll("#options-container input[type='radio']").forEach(r => r.checked = false);
}


/* ==========================================================
   FUNCIÓN: addQuestion()
   ----------------------------------------------------------
   Limpia el formulario para que el usuario agregue una
   nueva pregunta sin alterar las anteriores.
   Se ejecuta al presionar el botón "➕ Agregar".
   ========================================================== */
function addQuestion() {
  clearForm();
  alert("🆕 Formulario listo para una nueva pregunta.");
}


/* ==========================================================
   FUNCIÓN: uploadGist()
   ----------------------------------------------------------
   Sube el JSON con las preguntas almacenadas en "questions"
   directamente a GitHub Gist como un archivo público.
   Requiere:
     - Nombre del archivo JSON (input#json-name)
     - Contenido en el arreglo global "questions"
   ========================================================== */
async function uploadGist() {
  const jsonName = document.getElementById("json-name").value.trim();
  if (!jsonName) return alert("⚠️ Escribe un nombre para el archivo JSON.");
  if (questions.length === 0) return alert("⚠️ No hay preguntas para subir.");

  // Estructura que GitHub Gist espera
  const gistData = {
    description: "Preguntas generadas desde el Editor de MathLock",
    public: true,
    files: {
      [`${jsonName}.json`]: { content: JSON.stringify(questions, null, 2) }
    }
  };

  try {
    const response = await fetch("https://api.github.com/gists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(gistData)
    });

    const data = await response.json();

    if (data.html_url) {
      alert(`✅ Subido correctamente:\n${data.html_url}`);
    } else {
      alert("❌ Error al subir a Gist.");
    }
  } catch (err) {
    console.error(err);
    alert("⚠️ Ocurrió un error al subir a Gist.");
  }
}


/* ==========================================================
   EVENTOS PRINCIPALES
   ----------------------------------------------------------
   Se ejecutan cuando se cargan los botones en el DOM.
   Vinculan las funciones anteriores con los botones:
     - ➕ Agregar  → addQuestion()
     - ⬆️ Subir a Gist → uploadGist()
   ========================================================== */
document.getElementById("addQuestion").addEventListener("click", addQuestion);
document.getElementById("uploadGist").addEventListener("click", uploadGist);

/**
 * Sube el archivo JSON completo con todas las preguntas guardadas a GitHub Gist.
 * Se comunica con el endpoint /api/upload-file en tu proyecto de Vercel.
 */
async function uploadToGist() {
  if (questions.length === 0) {
    alert("No hay preguntas para subir.");
    return;
  }

  const filename = prompt("Nombre del archivo JSON:", "guia_estudio.json");
  if (!filename) return;

  const content = JSON.stringify(questions, null, 2);

  try {
    const response = await fetch("/api/upload-file", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, filename })
    });

    const data = await response.json();

    if (response.ok) {
      alert(`✅ Gist creado correctamente.\nURL: ${data.html_url}`);
      console.log("Gist URL:", data.html_url);
    } else {
      alert(`❌ Error al crear el Gist: ${data.message || "Error desconocido"}`);
      console.error(data);
    }
  } catch (err) {
    alert("⚠️ Error al conectar con el servidor.");
    console.error(err);
  }
}

// Asociar al botón
document.getElementById("uploadGist").addEventListener("click", uploadToGist);

