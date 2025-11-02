/**
 * ============================================================
 * 🧠 API: /api/upload-file.js
 * ------------------------------------------------------------
 * 📌 Función:
 *    Recibe el contenido de un archivo JSON desde el frontend
 *    y crea un nuevo Gist público en GitHub usando el token
 *    configurado en las variables de entorno.
 *
 * 🧰 Compatibilidad:
 *    ✅ Funciona en Vercel (Edge/Serverless)
 *    ✅ Funciona en Node.js local (Express o vercel dev)
 *
 * 🔒 Seguridad:
 *    - Requiere la variable de entorno GITHUB_TOKEN.
 *    - Limita el tamaño máximo del contenido recibido.
 *    - No permite métodos distintos de POST.
 * ============================================================
 */

export default async function handler(req, res) {
  try {
    // --- 1️⃣ Validar método HTTP ---
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Método no permitido (usa POST)" });
    }

    // --- 2️⃣ Verificar token en entorno ---
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      console.error("❌ Error: Falta GITHUB_TOKEN en variables de entorno.");
      return res
        .status(500)
        .json({ error: "Servidor no configurado: falta GITHUB_TOKEN" });
    }

    // --- 3️⃣ Leer cuerpo de la solicitud ---
    const { content, filename } = req.body || {};

    // Validaciones básicas
    if (!content || !filename) {
      return res
        .status(400)
        .json({ error: "Faltan parámetros: 'content' y/o 'filename'." });
    }

    // Evitar nombres con rutas o caracteres peligrosos
    if (filename.includes("/") || filename.includes("\\")) {
      return res.status(400).json({ error: "Nombre de archivo no válido." });
    }

    // Limitar tamaño (por ejemplo, 500 KB)
    const maxSize = 500 * 1024;
    if (Buffer.byteLength(content, "utf8") > maxSize) {
      return res
        .status(413)
        .json({ error: "El archivo excede el tamaño máximo (500KB)." });
    }

    // --- 4️⃣ Preparar datos para la API de GitHub ---
    const gistData = {
      description: `📘 Archivo generado desde MathLock - ${new Date().toLocaleString()}`,
      public: true,
      files: {
        [filename]: { content },
      },
    };

    // --- 5️⃣ Llamada a la API de GitHub ---
    const response = await fetch("https://api.github.com/gists", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        "User-Agent": "MathLockUploader", // útil para depuración
      },
      body: JSON.stringify(gistData),
    });

    const data = await response.json();

    // --- 6️⃣ Manejar respuesta ---
    if (!response.ok) {
      console.error("❌ Error de GitHub:", data);
      return res.status(response.status).json({
        error: "No se pudo crear el Gist.",
        details: data,
      });
    }

    // --- 7️⃣ Responder al cliente ---
    return res.status(200).json({
      message: "✅ Gist creado correctamente",
      id: data.id,
      html_url: data.html_url,
      file_url: data.files[filename]?.raw_url,
    });
  } catch (error) {
    console.error("💥 Error inesperado en /api/upload-file:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}
