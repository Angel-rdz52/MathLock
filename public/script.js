// script.js - Editor de Preguntas MathLock
// ---------------------------------------
// Controla la creación, visualización y exportación de preguntas en formato JSON.

// ==============================
// VARIABLES GLOBALES
// ==============================
let questions = [];
let currentType = "multiple";

// ==============================
// FUNCIÓN: cambiar tipo de pregunta
// ==============================
function typeQuestion() {
  const select = document.getElementById("type");
  const optionsContainer = document.getElementById("options-container");
  const openAnswer = document.getElementById("open-answer-container");

  currentType = select.value;

  if (currentType === "abierta") {
    optionsContainer.classList.add("hidden");
    openAnswer.classList.remove("hidden");
  } else {
    optionsContainer.classList.remove("hidden");
    openAnswer.classList.add("hidden");
  }
}

// ==============================
// FUNCIÓN: guardar pregunta
// ==============================
function saveQuestion() {
  const difficulty = document.getElementById("difficulty").value;
  const questionText = document.getElementById("question").value.trim();

  if (!questionText) {
    alert("⚠️ Escribe una pregunta antes de guardar.");
    return;
  }

  let questionObj = {
    dificultad: difficulty,
    tipo: currentType,
    pregunta: questionText,
  };

  if (currentType === "multiple") {
    const options = Array.from(
      document.querySelectorAll("#options-container .option input[type='text']")
    ).map((input) => input.value.trim());

    const correct = document.querySelector(
      "#options-container .option input[type='radio']:checked"
    );

    if (!correct) {
      alert("⚠️ Selecciona la respuesta correcta.");
      return;
    }

    questionObj.opciones = options;
    questionObj.correcta = parseInt(correct.value);
  } else {
    const openAnswer = document.getElementById("open-answer").value.trim();
    if (!openAnswer) {
      alert("⚠️ Escribe la respuesta correcta.");
      return;
    }
    questionObj.respuesta = openAnswer;
  }

  questions.push(questionObj);
  updatePreview();
  clearForm(false);
  alert("✅ Pregunta agregada correctamente.");
}

// ==============================
// FUNCIÓN: limpiar formulario
// ==============================
function clearForm(resetType = true) {
  document.getElementById("question").value = "";
  document
    .querySelectorAll("#options-container .option input[type='text']")
    .forEach((input) => (input.value = ""));
  document
    .querySelectorAll("#options-container .option input[type='radio']")
    .forEach((input) => (input.checked = false));
  document.getElementById("open-answer").value = "";

  if (resetType) {
    document.getElementById("type").value = "multiple";
    typeQuestion();
  }
}

// ==============================
// FUNCIÓN: actualizar vista JSON
// ==============================
function updatePreview() {
  const preview = document.getElementById("json-preview");
  preview.textContent = JSON.stringify(questions, null, 2);
}

// ==============================
// FUNCIÓN: exportar preguntas a archivo
// ==============================
async function uploadToGist() {
  if (questions.length === 0) {
    alert("⚠️ No hay preguntas para subir.");
    return;
  }

  const filename = prompt("Escribe un nombre para tu archivo JSON:", "preguntas.json");
  if (!filename) return;

  const content = JSON.stringify(questions, null, 2);

  try {
    const response = await fetch("/api/upload-file", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename, content })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Error al subir (server):", errorText);
      alert("Error al subir: " + errorText);
      return;
    }

    const data = await response.json();
    console.log("✅ Gist creado:", data);
    alert("Archivo subido exitosamente a Gist:\n" + data.html_url);
  } catch (err) {
    console.error("Error red/servidor:", err);
    alert("⚠️ Error al conectar con el servidor. Revisa la consola (F12).");
  }
}

// ==============================
// FUNCIÓN: agregar pregunta vacía (botón ➕)
// ==============================
function addQuestion() {
  clearForm();
  alert("📝 Nueva pregunta lista para editar.");
}

// ==============================
// EVENTOS AL CARGAR LA PÁGINA
// ==============================
document.addEventListener("DOMContentLoaded", () => {
  typeQuestion();

  document.getElementById("addQuestion").addEventListener("click", addQuestion);
  document.getElementById("uploadGist").addEventListener("click", uploadToGist);
  document.getElementById("saveQuestion").addEventListener("click", saveQuestion);
  document.getElementById("clearForm").addEventListener("click", () => clearForm());
});
