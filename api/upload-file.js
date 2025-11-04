// api/upload-file.js
// -------------------------------
// Sube el JSON generado por el editor a GitHub Gist (sin autenticación)

export default async function handler(req, res) {
  // Solo acepta POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido. Usa POST." });
  }

  try {
    const { filename, content } = req.body || {};

    // Validar datos
    if (!filename || !content) {
      return res.status(400).json({ error: "Faltan campos: filename o content" });
    }

    // Cuerpo del gist a crear
    const body = {
      description: "Archivo JSON generado desde MathLock",
      public: true,
      files: {
        [filename]: { content },
      },
    };

    // Crear gist en GitHub (sin token -> anónimo)
    const response = await fetch("https://api.github.com/gists", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "MathLock-App",
      },
      body: JSON.stringify(body),
    });

    // Verificar respuesta
    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({
        error: "Error al crear el Gist",
        details: errorText,
      });
    }

    // Retornar JSON con la URL del gist
    const data = await response.json();
    return res.status(200).json({
      message: "Gist creado correctamente",
      html_url: data.html_url,
    });
  } catch (err) {
    console.error("❌ Error del servidor:", err);
    return res.status(500).json({
      error: "Error interno del servidor",
      details: err.message,
    });
  }
}
