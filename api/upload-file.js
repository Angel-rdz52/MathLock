// =========================================================
// /api/upload-file.js - Endpoint para subir JSON a GitHub Gist
// ---------------------------------------------------------
// Compatible con Vercel (Serverless Function).
// Requiere variable de entorno GITHUB_TOKEN en Vercel.
// =========================================================

export default async function handler(req, res) {
  // Acepta solo POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido. Usa POST." });
  }

  const { filename, content } = req.body || {};

  // Validaciones
  if (!filename || !content) {
    return res.status(400).json({ error: "Faltan campos: filename o content." });
  }

  if (!process.env.GITHUB_TOKEN) {
    console.error("❌ Falta GITHUB_TOKEN en las variables de entorno");
    return res.status(500).json({ error: "Servidor sin token de GitHub configurado." });
  }

  try {
    // Crear el Gist público
    const gistResponse = await fetch("https://api.github.com/gists", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        description: "📘 Archivo generado desde MathLock JSON Editor",
        public: true,
        files: {
          [filename]: { content }
        }
      })
    });

    // Si GitHub devuelve error
    if (!gistResponse.ok) {
      const errorText = await gistResponse.text();
      console.error("❌ Error GitHub API:", errorText);
      return res.status(gistResponse.status).send(errorText);
    }

    // Respuesta exitosa
    const data = await gistResponse.json();
    console.log("✅ Gist creado correctamente:", data.html_url);
    return res.status(200).json({ html_url: data.html_url });
  } catch (error) {
    console.error("❌ Error interno:", error);
    return res.status(500).json({ error: "Error interno al crear el Gist." });
  }
}
