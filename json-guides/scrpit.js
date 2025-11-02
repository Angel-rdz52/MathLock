const questions = [];

document.getElementById('addQuestion').addEventListener('click', addQuestion);

function addQuestion() {
  const container = document.getElementById('questionsContainer');
  const card = document.createElement('div');
  card.classList.add('question-card');

  const radioGroup = 'correct-' + Date.now();

  card.innerHTML = `
    <div class="row">
      <div style="flex: 1;">
        <label>Dificultad:</label>
        <select class="difficulty">
          <option value="Fácil">Fácil</option>
          <option value="Media">Media</option>
          <option value="Difícil">Difícil</option>
        </select>
      </div>

      <div style="flex: 1;">
        <label>Tipo de pregunta:</label>
        <select class="type">
          <option value="multiple">Opción múltiple</option>
          <option value="abierta">Respuesta abierta</option>
        </select>
      </div>
    </div>

    <label>Pregunta:</label>
    <textarea class="questionText" rows="2" placeholder="Escribe la pregunta..."></textarea>

    <div class="options">
      <label>Opciones:</label>
      ${[1,2,3,4].map(i => `
        <div>
          <input type="radio" name="${radioGroup}" class="correctOption" value="${i}">
          <input type="text" class="option" placeholder="Opción ${i}">
        </div>
      `).join('')}
    </div>
  `;

  const typeSelect = card.querySelector('.type');
  const optionsDiv = card.querySelector('.options');

  typeSelect.addEventListener('change', () => {
    optionsDiv.style.display = typeSelect.value === 'abierta' ? 'none' : 'block';
  });

  container.appendChild(card);
  updateJSON();

  card.querySelectorAll('input, select, textarea').forEach(el => {
    el.addEventListener('input', updateJSON);
    el.addEventListener('change', updateJSON);
  });
}

function updateJSON() {
  const cards = document.querySelectorAll('.question-card');
  const data = [];

  cards.forEach(card => {
    const type = card.querySelector('.type').value;
    const difficulty = card.querySelector('.difficulty').value;
    const questionText = card.querySelector('.questionText').value;

    let questionObj = { tipo: type, dificultad: difficulty, pregunta: questionText };

    if (type === 'multiple') {
      const options = Array.from(card.querySelectorAll('.option')).map(o => o.value);
      const correctIndex = Array.from(card.querySelectorAll('.correctOption')).findIndex(r => r.checked);
      questionObj.opciones = options;
      questionObj.correcta = options[correctIndex] || "";
    } else {
      questionObj.respuesta = "";
    }

    data.push(questionObj);
  });

  const fileName = document.getElementById('fileName').value || "guia_sin_nombre";
  const jsonOutput = { nombre: fileName, preguntas: data };
  document.getElementById('jsonPreview').textContent = JSON.stringify(jsonOutput, null, 2);
}

document.getElementById('uploadGist').addEventListener('click', () => {
  alert('Subida a Gist en desarrollo...');
});
