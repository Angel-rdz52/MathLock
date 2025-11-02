let questions = [];

document.getElementById('type').addEventListener('change', (e) => {
  const container = document.getElementById('options-container');
  container.style.display = e.target.value === 'multiple' ? 'block' : 'none';
});

document.getElementById('addQuestion').addEventListener('click', () => {
  const question = document.getElementById('question').value.trim();
  const type = document.getElementById('type').value;
  const answer = document.getElementById('answer').value.trim();
  const difficulty = document.getElementById('difficulty').value;
  const options = Array.from(document.querySelectorAll('.option')).map(opt => opt.value.trim()).filter(o => o);

  if (!question || !answer) {
    alert("Por favor completa la pregunta y la respuesta.");
    return;
  }

  let entry = { question, answer, difficulty };

  if (type === 'multiple') {
    if (options.length < 2) {
      alert("Agrega al menos dos opciones.");
      return;
    }
    entry.options = options;
  }

  questions.push(entry);
  document.getElementById('output').textContent = JSON.stringify(questions, null, 2);
  clearInputs();
});

function clearInputs() {
  document.getElementById('question').value = '';
  document.getElementById('answer').value = '';
  document.querySelectorAll('.option').forEach(opt => opt.value = '');
}

document.getElementById('generateJSON').addEventListener('click', () => {
  const jsonContent = JSON.stringify(questions, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'guia-estudio.json';
  a.click();
});

document.getElementById('uploadGist').addEventListener('click', async () => {
  if (questions.length === 0) {
    alert("Primero agrega al menos una pregunta.");
    return;
  }

  const jsonContent = JSON.stringify(questions, null, 2);

  const response = await fetch('/api/upload-file', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filename: 'guia-estudio.json',
      content: jsonContent
    })
  });

  try {
    const data = await response.json();
    if (data.html_url) {
      alert(`✅ Gist creado con éxito:\n${data.html_url}`);
    } else {
      alert(`❌ Error al crear el Gist:\n${JSON.stringify(data)}`);
    }
  } catch {
    alert("❌ Error inesperado al subir el archivo.");
  }
});
