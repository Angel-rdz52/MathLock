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

  // Actualiza el tipo actual
  currentType = select.value;

  // Si es pregunta abierta, oculta opciones y muestra campo de texto
  if (currentType === "abierta") {
    optionsContainer.classList.add("hidden");
    openAnswer.classList.remove("hidden");
  } else {
    // Si es múltiple, hace lo contrario
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

  // Si la pregunta es múltiple, toma las opciones
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
    // Si la pregunta es abierta
    const openAnswer = document.getElementById("open-answer").value.trim();
    if (!openAnswer) {
      alert("⚠️ Escribe la respuesta correcta.");
      return;
    }
    questionObj.respuesta = openAnswer;
  }

  // Agregar al arreglo y actualizar vista
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

  const filename = prompt("Nombre del archivo JSON:", "preguntas_bloque1.json");
  if (!filename) return;

  const content = JSON.stringify(questions, null, 2);

  try {
    const response = await fetch("/api/upload-file", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename, content })
    });

    let data;
    try {
      data = await response.json();
    } catch (err) {
      const text = await response.text();
      console.error("⚠️ Respuesta no-JSON del servidor:", text);
      throw new Error("El servidor devolvió una respuesta no válida.");
    }

    if (response.ok) {
      alert(`✅ Gist creado correctamente:\n${data.html_url}`);
      console.log("📎 URL del Gist:", data.html_url);
    } else {
      alert(`❌ Error al subir: ${data.message || "Error desconocido"}`);
      console.error("Detalles del error:", data);
    }
  } catch (err) {
    alert("⚠️ Error al conectar con el servidor. Revisa la consola.");
    console.error("Error general:", err);
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
  // Asegurar que todo esté sincronizado
  typeQuestion();

  document.getElementById("addQuestion").addEventListener("click", addQuestion);
  document.getElementById("uploadGist").addEventListener("click", uploadToGist);
  document.getElementById("saveQuestion").addEventListener("click", saveQuestion); // ✅ nuevo
  document.getElementById("clearForm").addEventListener("click", () => clearForm()); // ✅ nuevo

  // El botón de guardar usa el atributo onclick, pero podrías hacerlo así también:
  // document.querySelector(".actions button[onclick='saveQuestion()']").addEventListener("click", saveQuestion);
});
