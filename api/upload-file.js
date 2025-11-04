// /api/upload-file.js
// Serverless function para Vercel - crea un Gist público en GitHub.
// Requiere la variable de entorno GITHUB_TOKEN (con permiso "gist").

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido. Usa POST." });
  }

  try {
    // En Vercel el body suele llegar ya parseado; si es string, parsearlo.
    let { filename, content } = req.body || {};

    if (typeof filename === "string" && typeof content === "string" && filename.trim() === "") {
      // caso improbable; lo mantenemos seguro
      return res.status(400).json({ error: "Filename vacío" });
    }

    // Si el body llegó como string (rare) intentar parsear
    if (!filename || !content) {
      // intentamos leer como string y parsearlo
      const raw = req.body;
      if (typeof raw === "string") {
        try {
          const parsed = JSON.parse(raw);
          filename = parsed.filename;
          content = parsed.content;
        } catch {
          // continúa, devolveremos error abajo
        }
      }
    }

    if (!filename || !content) {
      return res.status(400).json({ error: "Faltan datos: 'filename' y/o 'content'." });
    }

    // Sanitizar filename básico (evitar rutas)
    if (filename.includes("/") || filename.includes("\\")) {
      return res.status(400).json({ error: "Nombre de archivo inválido." });
    }

    // Validar token
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      console.error("Falta GITHUB_TOKEN en vars de entorno.");
      return res.status(500).json({ error: "Servidor no configurado: falta GITHUB_TOKEN." });
    }

    // Limitar tamaño (ej. 500KB)
    const maxSize = 500 * 1024;
    if (Buffer.byteLength(content, "utf8") > maxSize) {
      return res.status(413).json({ error: "Archivo demasiado grande (máx 500KB)." });
    }

    // Llamada a la API de GitHub
    const ghResp = await fetch("https://api.github.com/gists", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        "Accept": "application/vnd.github+json"
      },
      body: JSON.stringify({
        description: `Preguntas generadas desde MathLock - ${filename}`,
        public: true,
        files: {
          [filename]: { content }
        }
      })
    });

    const text = await ghResp.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (err) {
      console.error("Respuesta no JSON de GitHub:", text);
      return res.status(502).json({ error: "Respuesta inesperada desde GitHub", raw: text });
    }

    if (!ghResp.ok) {
      console.error("GitHub API error:", data);
      return res.status(ghResp.status).json({ error: data.message || "Error al crear Gist", details: data });
    }

    // Éxito
    return res.status(200).json({
      message: "Gist creado correctamente",
      html_url: data.html_url,
      id: data.id,
      files: data.files
    });

  } catch (err) {
    console.error("Error interno en upload-file:", err);
    return res.status(500).json({ error: "Error interno del servidor", details: err.message });
  }
}
