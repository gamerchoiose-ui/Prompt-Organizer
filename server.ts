import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

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
  res.json({ status: "ok" });
});

// Endpoint to generate or optimize a prompt using Gemini
app.post("/api/generate-prompt", async (req, res) => {
  try {
    const { action, currentPrompt, instructions, taskType } = req.body;
    
    let systemInstruction = "You are an expert prompt engineer. Help users create, refine, and optimize structured AI prompts.";
    let contents = "";

    if (action === "generate") {
      contents = `Create a professional, highly effective AI prompt for the following goal/task type ("${taskType || 'general'}"): ${instructions}. 
      Provide a descriptive name, description, prompt text (with placeholders like {{variable}} if appropriate), tags (array), associated task, example input, and example output.`;
    } else if (action === "optimize") {
      contents = `Optimize and improve the following prompt based on these instructions ("${instructions}"):
      Name: ${currentPrompt.name}
      Description: ${currentPrompt.description}
      Prompt Text: ${currentPrompt.prompt_text}
      Associated Task: ${currentPrompt.associated_task}
      
      Make it clearer, more structured, and robust for Gemini or LLMs.`;
    } else {
      contents = instructions;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
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
  } catch (error: any) {
    console.error("Gemini Generate Prompt Error:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to generate prompt" });
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
      model: "gemini-3.7-flash",
      contents: finalPrompt,
    });

    res.json({ success: true, output: response.text });
  } catch (error: any) {
    console.error("Gemini Test Prompt Error:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to test prompt" });
  }
});

async function startServer() {
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

  // Catch-all route to serve index.html for client-side routing
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ error: 'API endpoint not found' });
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
