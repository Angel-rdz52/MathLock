// /api/upload-file.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  // Verificar método
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método no permitido" });
  }

  const { filename, content } = req.body || {};

  // Validar datos
  if (!filename || !content) {
    return res.status(400).json({ message: "Faltan datos: filename o content" });
  }

  // Validar token
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return res.status(500).json({ message: "Token de GitHub no configurado en .env" });
  }

  try {
    // Crear Gist público
    const response = await fetch("https://api.github.com/gists", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `token ${token}`
      },
      body: JSON.stringify({
        description: "Preguntas creadas desde el Editor de MathLock",
        public: true,
        files: {
          [filename]: { content }
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Error Gist:", data);
      return res.status(response.status).json({
        message: data.message || "Error al crear el Gist",
        data
      });
    }

    return res.status(200).json({
      message: "Gist creado correctamente",
      html_url: data.html_url
    });
  } catch (err) {
    console.error("Error general:", err);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
}
