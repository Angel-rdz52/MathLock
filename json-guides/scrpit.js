let questions = [];

document.addEventListener("DOMContentLoaded", () => {
  const addBtn = document.getElementById("addQuestionBtn");
  const uploadBtn = document.getElementById("uploadGistBtn");
  const questionType = document.getElementById("questionType");
  const optionsContainer = document.getElementById("optionsContainer");

  // Mostrar u ocultar opciones según tipo
  questionType.addEventListener("change", () => {
    if (questionType.value === "abierta") {
      optionsContainer.style.display = "none";
    } else {
      optionsContainer.style.display = "block";
    }
  });

  // Agregar pregunta
  addBtn.addEventListener("click", () => {
    const difficulty = document.getElementById("difficulty").value;
    const type = questionType.value;
    const question = document.getElementById("questionText").value.trim();

    if (!question) {
      alert("Escribe la pregunta antes de continuar");
      return;
    }

    let questionObj = { dificultad: difficulty, tipo: type, pregunta: question };

    if (type === "opcion") {
      const options = Array.from(document.querySelectorAll("#optionsContainer .option input[type='text']")).map(i => i.value.trim());
      const correctIndex = document.querySelector("input[name='correctOption']:checked");

      if (options.some(o => !o)) {
        alert("Completa todas las opciones");
        return;
      }

      if (!correctIndex) {
        alert("Selecciona la respuesta correcta");
        return;
      }

      questionObj.opciones = options;
      questionObj.correcta = options[correctIndex.value];
    } else {
      questionObj.respuesta = "Respuesta abierta";
    }

    questions.push(questionObj);
    renderJSON();
    resetForm();
  });

  uploadBtn.addEventListener("click", uploadToGist);
});

function renderJSON() {
  const jsonPreview = document.getElementById("jsonPreview");
  jsonPreview.textContent = JSON.stringify(questions, null, 2);
}

function resetForm() {
  document.getElementById("questionText").value = "";
  document.querySelectorAll("#optionsContainer .option input[type='text']").forEach(i => i.value = "");
  document.querySelectorAll("input[name='correctOption']").forEach(r => r.checked = false);
}

async function uploadToGist() {
  const jsonContent = JSON.stringify(questions, null, 2);
  const response = await fetch('/api/upload-file', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filename: 'guia-estudio.json',
      content: jsonContent
    })
  });

  const data = await response.json();
  if (data.html_url) {
    alert(`✅ Gist creado: ${data.html_url}`);
  } else {
    alert(`❌ Error al crear Gist: ${JSON.stringify(data)}`);
  }
}
