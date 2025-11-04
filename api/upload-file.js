// /api/upload-file.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { fileName, fileContent, token } = await req.body;
  try {
    const response = await fetch("https://api.github.com/gists", {
      method: "POST",
      headers: {
        "Authorization": `token ${token}`,
        "Accept": "application/vnd.github+json",
      },
      body: JSON.stringify({
        description: `Archivo subido desde MathLock`,
        public: false,
        files: {
          [fileName]: { content: fileContent }
        }
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    res.status(200).json({ url: data.html_url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
