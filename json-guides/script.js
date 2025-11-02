/* ==========================================================
   🧮 Editor de Preguntas - MathLock
   ----------------------------------------------------------
   Permite crear, visualizar y subir preguntas (tipo test o
   abiertas) en formato JSON a GitHub Gist.
   Compatible con el backend /api/upload-file.js.
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
     - input#open-answer
     - div#options-container
     - pre#json-preview
   ========================================================== */
function saveQuestion() {
  const questionText = document.getElementById("question").value.trim();
  const difficulty = document.getElementById("difficulty").value;
  const type = document.getElementById("type").value;
  const preview = document.getElementById("json-preview");

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

  // Actualizar vista previa del JSON
  if (preview) {
    preview.textContent = JSON.stringify(questions, null, 2);
  }

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
   FUNCIÓN: uploadToGist()
   ----------------------------------------------------------
   Sube el JSON con las preguntas almacenadas en "questions"
   directamente al backend /api/upload-file.js, que luego
   crea un Gist público en GitHub.
   Elementos involucrados:
     - Arreglo global "questions"
     - Prompt del nombre del archivo JSON
   ========================================================== */
async function uploadToGist() {
  if (questions.length === 0) {
    alert("⚠️ No hay preguntas para subir.");
    return;
  }

  // Solicitar nombre del archivo al usuario
  const filename = prompt("📄 Escribe un nombre para el archivo JSON:", "preguntas_" + Date.now() + ".json");
  if (!filename) return alert("❌ Operación cancelada.");

  // Convertir preguntas a JSON legible
  const content = JSON.stringify(questions, null, 2);

  try {
    const response = await fetch("/api/upload-file", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, filename })
    });

    const data = await response.json();

    if (response.ok) {
      alert(`✅ Gist creado correctamente:\n${data.html_url}`);
      console.log("🌐 Gist URL:", data.html_url);
    } else {
      alert(`❌ Error al crear el Gist: ${data.error || data.message}`);
      console.error(data);
    }
  } catch (err) {
    alert("⚠️ Error al conectar con el servidor.");
    console.error(err);
  }
}


/* ==========================================================
   EVENTOS PRINCIPALES
   ----------------------------------------------------------
   Se ejecutan cuando se cargan los botones en el DOM.
   Vinculan las funciones anteriores con los botones:
     - ➕ Agregar        → addQuestion()
     - 💾 Guardar        → saveQuestion()
     - ⬆️ Subir a Gist   → uploadToGist()
   ========================================================== */
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("addQuestion").addEventListener("click", addQuestion);
  document.getElementById("uploadGist").addEventListener("click", uploadToGist);
  const saveButton = document.querySelector(".actions button[onclick='saveQuestion()']");
  if (saveButton) saveButton.addEventListener("click", saveQuestion);
});
