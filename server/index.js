
import express from "express";
import cors from "cors";
import "dotenv/config";

import { publicScenarios } from "./scenarios.js";
import { analyzeScenario } from "./engine.js";
import { getAiExplanation } from "./ai.js";
import { generateFix } from "./fix.js";

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://127.0.0.1:5173"
    ]
  })
);

app.use(express.json({ limit: "20kb" }));

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

// Retrieve predefined debugging scenarios
app.get("/api/scenarios", (_req, res) => {
  res.json(publicScenarios);
});

// Analyze a predefined debugging scenario
app.post("/api/analyze", async (req, res) => {
  const id = req.body?.scenarioId;

  if (typeof id !== "string") {
    return res.status(400).json({
      error: "scenarioId is required"
    });
  }

  const result = analyzeScenario(id);

  if (!result) {
    return res.status(404).json({
      error: "Unknown scenario"
    });
  }

  const ai = await getAiExplanation(result);

  res.json({
    ...result,
    ai
  });
});

// Generate an AI-suggested fix for custom JavaScript
app.post("/api/fix", async (req, res) => {
  const { code, issue } = req.body || {};

  // Validate required inputs
  if (
    typeof code !== "string" ||
    !code.trim() ||
    typeof issue !== "string" ||
    !issue.trim()
  ) {
    return res.status(400).json({
      error: "JavaScript code and bug description are required"
    });
  }

  // Enforce input size limits
  if (code.length > 10000 || issue.length > 2000) {
    return res.status(400).json({
      error: "Input is too long"
    });
  }

  try {
    const result = await generateFix(code, issue);

    return res.json(result);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "An unexpected error occurred";

    console.error("AI fix error:", message);

    const isQuotaError = message.includes(
      "rate limit or quota has been reached"
    );

    return res.status(isQuotaError ? 429 : 502).json({
      error: message
    });
  }
});

// Start the Express server
const port = Number(process.env.PORT || 4000);

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
