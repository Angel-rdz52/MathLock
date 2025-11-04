// api/upload-file.js
// ------------------
// API para subir un archivo JSON como Gist en GitHub

import { Octokit } from "octokit";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido. Usa POST." });
  }

  try {
    const { filename, content } = req.body;

    if (!filename || !content) {
      return res.status(400).json({ error: "Faltan campos: filename o content." });
    }

    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      return res.status(500).json({ error: "Falta el token de GitHub en las variables de entorno." });
    }

    const octokit = new Octokit({ auth: token });

    const response = await octokit.request("POST /gists", {
      description: "Archivo generado desde MathLock",
      public: false,
      files: {
        [filename]: { content },
      },
    });

    return res.status(200).json({
      id: response.data.id,
      html_url: response.data.html_url,
    });
  } catch (error) {
    console.error("Error al crear Gist:", error);
    return res.status(500).json({
      error: "Error interno al crear el Gist",
      details: error.message,
    });
  }
}
