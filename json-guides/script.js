function typeQuestion() {
  const typeSelect = document.getElementById("type");
  const optionsContainer = document.getElementById("optionsContainer");
  const openAnswerContainer = document.getElementById("openAnswerContainer");

  if (typeSelect.value === "abierta") {
    optionsContainer.style.display = "none";
    openAnswerContainer.style.display = "block";
  } else {
    optionsContainer.style.display = "block";
    openAnswerContainer.style.display = "none";
  }
}

window.onload = () => {
  typeQuestion(); // Estado inicial

  const addQuestionBtn = document.getElementById("addQuestion");
  const output = document.getElementById("output");
  const questions = [];

  addQuestionBtn.addEventListener("click", () => {
    const type = document.getElementById("type").value;
    const difficulty = document.getElementById("difficulty").value;
    const question = document.getElementById("question").value.trim();
    const jsonName = document.getElementById("jsonName").value.trim();

    if (!jsonName) {
      alert("Agrega un nombre para el archivo JSON.");
      return;
    }

    if (!question) {
      alert("Escribe la pregunta antes de continuar.");
      return;
    }

    const questionObj = {
      pregunta: question,
      dificultad: difficulty,
      tipo: type,
    };

    if (type === "multiple") {
      const options = [
        document.getElementById("option1").value,
        document.getElementById("option2").value,
        document.getElementById("option3").value,
        document.getElementById("option4").value
      ];

      const correctOption = document.querySelector("input[name='correctOption']:checked");
      if (!correctOption) {
        alert("Selecciona una respuesta correcta.");
        return;
      }

      questionObj.opciones = options;
      questionObj.correcta = parseInt(correctOption.value);
    } else {
      const openAnswer = document.getElementById("openAnswer").value.trim();
      if (!openAnswer) {
        alert("Agrega la respuesta correcta.");
        return;
      }
      questionObj.respuesta = openAnswer;
    }

    questions.push(questionObj);
    output.textContent = JSON.stringify({ nombre: jsonName, preguntas: questions }, null, 2);
  });
};
