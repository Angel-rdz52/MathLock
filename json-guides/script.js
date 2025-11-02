<script>
/* ======================================================
   🎯 JSON Study Generator – Script principal
   ------------------------------------------------------
   Funciones principales:
   - typeQuestion(): controla visibilidad de opciones según tipo.
   - generateQuestion(): genera una nueva pregunta en el JSON.
   - downloadJSON(): descarga las preguntas en un archivo local.
   - uploadToGist(): sube el archivo JSON a GitHub Gist público.
   ====================================================== */

/**
 * 🔹 typeQuestion()
 * Muestra u oculta el contenedor de opciones y campo de respuesta correcta
 * según el tipo de pregunta seleccionado ("opción múltiple" o "abierta").
 */
function typeQuestion() {
  const typeSelect = document.getElementById("type");
  const optionsContainer = document.getElementById("optionsContainer");
  const correctAnswerContainer = document.getElementById("correctAnswerContainer");

  if (typeSelect.value === "abierta") {
    optionsContainer.style.display = "none";
    correctAnswerContainer.style.display = "block"; // mostrar campo de texto para respuesta abierta
  } else {
    optionsContainer.style.display = "block";
    correctAnswerContainer.style.display = "none"; // ocultar campo de texto si es múltiple
  }
}

/**
 * 🔹 generateQuestion()
 * Toma los valores de los campos del formulario y los convierte
 * en un objeto de pregunta. Agrega la pregunta al JSON actual.
 */
function generateQuestion() {
  const questionInput = document.getElementById("question").value.trim();
  const difficulty = document.getElementById("difficulty").value;
  const type = document.getElementById("type").value;
  const jsonOutput = document.getElementById("jsonOutput");
  const correctAnswer = document.getElementById("correctAnswer").value.trim();

  if (!questionInput) {
    alert("Por favor ingresa una pregunta.");
    return;
  }

  const newQuestion = {
    pregunta: questionInput,
    dificultad: difficulty,
    tipo: type,
  };

  // Si es de opción múltiple, tomar las opciones
  if (type === "multiple") {
    const options = Array.from(document.querySelectorAll(".option-input")).map((input) => input.value.trim());
    const correctIndex = document.querySelector("input[name='correctOption']:checked");

    if (!correctIndex) {
      alert("Selecciona la respuesta correcta.");
      return;
    }

    newQuestion.opciones = options;
    newQuestion.respuestaCorrecta = options[parseInt(correctIndex.value)];
  } else {
    // Si es abierta
    if (!correctAnswer) {
      alert("Debes ingresar la respuesta correcta.");
      return;
    }
    newQuestion.respuestaCorrecta = correctAnswer;
  }

  // Leer JSON actual (si existe)
  let currentData = [];
  try {
    currentData = JSON.parse(jsonOutput.value || "[]");
  } catch (e) {
    currentData = [];
  }

  // Agregar nueva pregunta
  currentData.push(newQuestion);

  // Mostrar JSON actualizado
  jsonOutput.value = JSON.stringify(currentData, null, 2);

  // Limpiar formulario
  document.getElementById("questionForm").reset();
  typeQuestion(); // actualizar visibilidad de secciones
}

/**
 * 🔹 downloadJSON()
 * Permite descargar localmente el JSON generado.
 */
function downloadJSON() {
  const content = document.getElementById("jsonOutput").value;
  if (!content) {
    alert("No hay contenido para descargar.");
    return;
  }

  const blob = new Blob([content], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "preguntas.json";
  link.click();
}

/**
 * 🔹 uploadToGist()
 * Sube el JSON actual a GitHub Gist de forma pública.
 * Pide un nombre de archivo antes de subir.
 */
async function uploadToGist() {
  const status = document.getElementById("status");
  status.textContent = "📤 Preparando subida a Gist...";

  try {
    // Obtener el contenido del JSON
    const content = document.getElementById("jsonOutput").value.trim();
    if (!content) {
      alert("No hay contenido JSON para subir.");
      status.textContent = "⚠️ No hay contenido JSON.";
      return;
    }

    // Pedir nombre de archivo
    const filename = prompt("Ingresa un nombre para el archivo JSON:", "guia_estudio.json");
    if (!filename) {
      status.textContent = "❌ Subida cancelada por el usuario.";
      return;
    }

    // Confirmar si se usa el nombre por defecto
    if (filename === "guia_estudio.json") {
      const confirmDefault = confirm(
        "⚠️ Estás usando el nombre por defecto 'guia_estudio.json'.\n¿Deseas continuar?"
      );
      if (!confirmDefault) {
        status.textContent = "🚫 Subida cancelada (nombre por defecto).";
        return;
      }
    }

    // Subir al endpoint API
    status.textContent = "⏳ Subiendo archivo a GitHub Gist...";
    const response = await fetch("/api/upload-file", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, filename }),
    });

    const data = await response.json();

    if (response.ok) {
      status.innerHTML = `✅ Archivo subido con éxito.<br>
        🌐 <a href="${data.html_url}" target="_blank">${filename}</a>`;
    } else {
      console.error(data);
      status.textContent = `❌ Error al subir: ${data.message || "Desconocido"}`;
    }
  } catch (error) {
    console.error(error);
    status.textContent = "💥 Error inesperado al subir el archivo.";
  }
}

// Inicializar visibilidad correcta al cargar
document.addEventListener("DOMContentLoaded", typeQuestion);
</script>
