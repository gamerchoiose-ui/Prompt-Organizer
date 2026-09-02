import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import "dotenv/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_MODEL = process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;

app.use(express.json({ limit: '10mb' }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", model: GEMINI_MODEL });
});

// Endpoint to generate or optimize a prompt using Gemini
app.post("/api/generate-prompt", async (req, res) => {
  try {
    const { action, currentPrompt, instructions, taskType } = req.body;
    
    const systemInstruction = "You are an expert prompt engineer and system integration assistant. Your core task is to create and structure a new prompt entry while guaranteeing that all associated metadata—specifically its assigned category and tags—are fully indexed, linked, and searchable.";
    let contents = "";

    if (action === "generate") {
      contents = `Create a professional, highly effective AI prompt for the following goal/task type ("${taskType || 'Writing'}"): ${instructions}. 

      Requirements:
      1. Core Task: Create a new prompt based on the provided text/goal.
      2. Categorization: Assign the prompt to the specified category ("${taskType || 'Writing'}").
      3. Tagging: Associate the prompt with relevant tags as an array of strings.
      4. Crucial Linking & Discoverability Instruction: Ensure that the assignment of the category and tags to the prompt is correctly registered and linked within the system's data structure, so that the prompt is immediately discoverable when users filter or search by this category or any of these tags.
      
      Provide a descriptive name, description, prompt text (with placeholders like {{variable}} if appropriate), tags (array), associated task, example input, and example output.`;
    } else if (action === "optimize") {
      contents = `Optimize and improve the following prompt based on these instructions ("${instructions}"):
      Name: ${currentPrompt.name}
      Description: ${currentPrompt.description}
      Prompt Text: ${currentPrompt.prompt_text}
      Associated Task: ${currentPrompt.associated_task}
      Tags: ${(currentPrompt.tags || []).join(', ')}
      
      Make it clearer, more structured, and robust for Gemini or LLMs, while ensuring that the category ("${currentPrompt.associated_task}") and tags remain correctly linked and discoverable.`;
    } else {
      contents = instructions;
    }

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            name: { type: "STRING", description: "Descriptive Name of the Prompt" },
            description: { type: "STRING", description: "A brief explanation of the prompt's purpose and intended use." },
            prompt_text: { type: "STRING", description: "The actual text of the prompt." },
            tags: { type: "ARRAY", items: { type: "STRING" }, description: "Keywords or labels for categorization." },
            associated_task: { type: "STRING", description: "e.g., writing, coding, brainstorming, summarization, analysis, marketing" },
            example_input: { type: "STRING", description: "Optional example input for the prompt." },
            example_output: { type: "STRING", description: "Optional example output for the prompt." }
          },
          required: ["name", "description", "prompt_text", "tags", "associated_task"]
        }
      }
    });

    const jsonText = response.text || "{}";
    const result = JSON.parse(jsonText);
    res.json({ success: true, prompt: result });
  } catch (error: unknown) {
    console.error("Gemini Generate Prompt Error:", error);
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : "Failed to generate prompt" });
  }
});

// Endpoint to test a prompt with input using Gemini
app.post("/api/test-prompt", async (req, res) => {
  try {
    const { promptText, inputValues } = req.body;
    
    // Replace variables in promptText if inputValues is provided
    let finalPrompt = promptText;
    if (inputValues && typeof inputValues === 'object') {
      for (const [key, val] of Object.entries(inputValues)) {
        const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
        finalPrompt = finalPrompt.replace(regex, String(val));
      }
    }

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: finalPrompt,
    });

    res.json({ success: true, output: response.text });
  } catch (error: unknown) {
    console.error("Gemini Test Prompt Error:", error);
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : "Failed to test prompt" });
  }
});

// Endpoint for advanced search & scoring (Elasticsearch architecture simulation)
app.post("/api/search", (req, res) => {
  try {
    const { query, prompts, filters } = req.body;
    if (!prompts || !Array.isArray(prompts)) {
      return res.status(400).json({ success: false, error: "Prompts array required" });
    }

    const searchQuery = (query || "").trim().toLowerCase();
    
    // Score and filter prompts with boosted field relevance
    const results = prompts.map((prompt: Record<string, unknown>) => {
      let score = 0;
      const name = (String(prompt.name || "")).toLowerCase();
      const desc = (String(prompt.description || "")).toLowerCase();
      const text = (String(prompt.prompt_text || "")).toLowerCase();
      const tags = (Array.isArray(prompt.tags) ? prompt.tags : []).map((t: unknown) => String(t).toLowerCase());
      const task = (String(prompt.associated_task || "")).toLowerCase();

      if (!searchQuery) {
        score = 1.0;
      } else {
        if (name.includes(searchQuery)) score += 10.0;
        if (desc.includes(searchQuery)) score += 5.0;
        if (text.includes(searchQuery)) score += 2.0;
        if (tags.some(t => t.includes(searchQuery))) score += 4.0;
        if (task.includes(searchQuery)) score += 3.0;

        // Fuzzy / prefix matching fallback
        if (score === 0 && searchQuery.length > 2) {
          if (name.startsWith(searchQuery.slice(0, 2)) || desc.startsWith(searchQuery.slice(0, 2))) {
            score += 0.5;
          }
        }
      }

      let matchesFilters = true;
      if (filters) {
        if (filters.associated_task && filters.associated_task !== 'All Tasks' && prompt.associated_task !== filters.associated_task) {
          matchesFilters = false;
        }
        if (filters.is_favorite && !prompt.is_favorite) {
          matchesFilters = false;
        }
        if (filters.tag && (!Array.isArray(prompt.tags) || !prompt.tags.includes(filters.tag))) {
          matchesFilters = false;
        }
      }

      return {
        ...prompt,
        _score: score,
        _matches: score > 0 && matchesFilters
      };
    })
    .filter((item: { _matches: boolean; _score: number }) => item._matches)
    .sort((a: { _score: number }, b: { _score: number }) => b._score - a._score);

    res.json({ success: true, results, total: results.length });
  } catch (error: unknown) {
    console.error("Search API Error:", error);
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : "Search failed" });
  }
});

async function startServer() {
  if (!process.env.GEMINI_API_KEY) {
    console.warn("GEMINI_API_KEY is not set — /api/generate-prompt and /api/test-prompt will fail.");
  }
  console.log(`Using Gemini model: ${GEMINI_MODEL}`);
  const isProduction = process.env.NODE_ENV === "production";

  if (!isProduction) {
    try {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } catch (e) {
      console.error("Vite server middleware error, falling back to static:", e);
    }
  }

  // Determine static paths
  const possibleDistPaths = [
    path.join(process.cwd(), 'dist'),
    path.join(__dirname, 'dist'),
    path.join(__dirname),
    process.cwd()
  ];

  let servedDir = null;
  for (const p of possibleDistPaths) {
    if (fs.existsSync(path.join(p, 'index.html'))) {
      servedDir = p;
      break;
    }
  }

  if (servedDir) {
    app.use(express.static(servedDir));
  }

  // AFTER — matches any GET path, so deep links fall back to the SPA shell
  app.get('*', (req, res, next) => {
    // Never hand HTML to an unknown API path
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ error: 'API endpoint not found' });
    }

    // Only SPA-fallback for navigation requests, not for missing assets
    // (e.g. a deleted /assets/*.js should 404, not return index.html as 200)
    if (req.accepts('html') !== 'html' && req.path.startsWith('/assets/')) {
      return next();
    }

    for (const p of possibleDistPaths) {
      const indexPath = path.join(p, 'index.html');
      if (fs.existsSync(indexPath)) {
        return res.sendFile(indexPath);
      }
    }
    res.status(404).send('Application build output (index.html) not found. Please run npm run build.');
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
