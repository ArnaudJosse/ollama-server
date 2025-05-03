import express from 'express';
//import ollama from 'ollama';
import { Ollama } from 'ollama';

const app = express(); // Instance d'Express
const port = 80; // Port à l'écoute

app.use(express.json());

// On sert le dossier public en statique, dans lequel on place notre page index.html
app.use(express.static('public'));

// On accepte les requêtes POST vers /chat
app.post('/chat', async (req, res) => {
  // Notre message sera envoyé dans le corps de la requête (body)
  const message = { role: 'user', content: req.body.content };
  const ollama = new Ollama({ host: 'http://192.168.1.14:11434' })
  // La réponse provenant du LLM est une promesse
  const response = await ollama.chat({ model: 'qwen2.5-coder:14b', messages: [message], stream: true });

  // La réponse envoyée à la page web dispose d'en-têtes HTTP
  // ... permettant de faire persister la connexion
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  // Pour toute portion de réponse reçue, on la stream
  for await (const part of response) {
    res.write(`data: ${JSON.stringify(part.message)}\n\n`);
  }

  res.end();
});

// On écoute sur le port configuré
app.listen(port, () => {
  console.log(`Serveur en écoute : http://localhost:${port}`);
});
