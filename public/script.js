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
  document.getElementById("json-preview").textContent = JSON.stringify(questions, null, 2);
}

// ==============================
// FUNCIÓN: descargar JSON localmente
// ==============================
function downloadJSON() {
  if (questions.length === 0) {
    alert("⚠️ No hay preguntas para descargar.");
    return;
  }

  const blob = new Blob([JSON.stringify(questions, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "preguntas_mathlock.json";
  link.click();
  URL.revokeObjectURL(link.href);
}

// ==============================
// EVENTOS AL CARGAR LA PÁGINA
// ==============================
document.addEventListener("DOMContentLoaded", () => {
  typeQuestion();
  document.getElementById("saveQuestion").addEventListener("click", saveQuestion);
  document.getElementById("clearForm").addEventListener("click", () => clearForm());
  document.getElementById("downloadJSON").addEventListener("click", downloadJSON);
});
