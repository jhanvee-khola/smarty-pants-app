import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("trivia.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS daily_trivia (
    date TEXT PRIMARY KEY,
    category TEXT,
    question TEXT,
    answer TEXT,
    fact TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/trivia/today", (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    const trivia = db.prepare("SELECT * FROM daily_trivia WHERE date = ?").get(today);
    
    if (trivia) {
      res.json(trivia);
    } else {
      res.status(404).json({ error: "Trivia not found for today" });
    }
  });

  app.post("/api/trivia/today", (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    const { category, question, answer, fact } = req.body;

    try {
      const info = db.prepare(`
        INSERT OR REPLACE INTO daily_trivia (date, category, question, answer, fact)
        VALUES (?, ?, ?, ?, ?)
      `).run(today, category, question, answer, fact);
      
      res.json({ success: true, id: info.lastInsertRowid });
    } catch (error) {
      console.error("Error saving trivia:", error);
      res.status(500).json({ error: "Failed to save trivia" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
