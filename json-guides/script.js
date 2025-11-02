let questions = [];

const typeSelect = document.getElementById("type");
const optionsContainer = document.getElementById("optionsContainer");
const preview = document.getElementById("jsonPreview");

// 🔹 Cambiar tipo de pregunta
function typeQuestion() {
  const typeSelect = document.getElementById("type");
  const optionsContainer = document.getElementById("optionsContainer");

  if (typeSelect.value === "abierta") {
    optionsContainer.style.display = "none";
  } else {
    optionsContainer.style.display = "block";
  }
}


// 🔹 Agregar pregunta al JSON
document.getElementById("saveQuestion").addEventListener("click", () => {
  const questionText = document.getElementById("questionText").value.trim();
  const difficulty = document.getElementById("difficulty").value;
  const type = document.getElementById("type").value;
  const fileName = document.getElementById("fileName").value || "guia_sin_nombre";

  if (!questionText) {
    alert("Por favor, escribe una pregunta.");
    return;
  }

  const newQuestion = {
    question: questionText,
    difficulty: difficulty,
    type: type
  };

  if (type === "multiple") {
    const optionInputs = Array.from(document.querySelectorAll(".optionInput"));
    const options = optionInputs.map(o => o.value.trim());
    const correct = document.querySelector('input[name="correctOption"]:checked');
    const correctIndex = correct ? parseInt(correct.value) : -1;

    if (options.some(o => o === "")) {
      alert("Completa todas las opciones.");
      return;
    }
    if (correctIndex === -1) {
      alert("Selecciona la respuesta correcta.");
      return;
    }

    newQuestion.options = options;
    newQuestion.answer = options[correctIndex];
  } else {
    newQuestion.options = [];
    newQuestion.answer = "";
  }

  questions.push(newQuestion);
  preview.textContent = JSON.stringify(questions, null, 2);

  // Limpia campos después de agregar
  document.getElementById("questionText").value = "";
  document.querySelectorAll(".optionInput").forEach(o => o.value = "");
  document.querySelectorAll('input[name="correctOption"]').forEach(r => r.checked = false);
});

// 🔹 Botón "Nueva pregunta" → enfoca el campo
document.getElementById("addQuestion").addEventListener("click", () => {
  document.getElementById("questionText").focus();
});

// 🔹 Simulación de subida a Gist (pendiente de conectar)
document.getElementById("uploadGist").addEventListener("click", () => {
  const fileName = document.getElementById("fileName").value || "guia_sin_nombre";
  alert(`Simulación: se subiría el archivo ${fileName}.json con ${questions.length} preguntas.`);
});
