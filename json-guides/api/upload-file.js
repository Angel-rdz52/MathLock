// api/upload-file.js

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { content, filename } = req.body;

  if (!process.env.GITHUB_TOKEN) {
    return res.status(500).json({ error: "Falta GITHUB_TOKEN en las variables de entorno" });
  }

  try {
    const response = await fetch("https://api.github.com/gists", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GITHUB_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        description: "Guía generada desde JSON Study Generator",
        public: true,
        files: {
          [filename]: {
            content
          }
        }
      })
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear el Gist" });
  }
}
