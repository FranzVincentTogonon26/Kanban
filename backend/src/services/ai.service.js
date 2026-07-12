import { GoogleGenAI } from "@google/genai";
import { ENV } from "../config/env.js";
import ApiError from "../utils/ApiError.js";

const MODEL = ENV.GIMINI_MODEL || "gemini-2.0-flash";
const VALID_PRIORITIES = ["low", "medium", "high", "urgent"];

let client = null;

const getClient = () => {
  const key = ENV.GIMINI_API_KEY;
  if (!key)
    throw new ApiError(503, "Gemini API key is not configured on the server.");

  if (!client) {
    client = new GoogleGenAI({ apiKey: key });
  }
  return client;
};

const extractJSON = (text) => {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : text;

  const start = candidate.search(/[[{]/);
  if (start === -1) throw new ApiError(502, "AI retured an expected response");

  const end = Math.max(candidate.lastIndexOf("]"), candidate.lastIndexOf("}"));

  try {
    return JSON.parse(candidate.slice(start, end + 1));
  } catch {
    throw new ApiError(502, "Failed to parse AI response");
  }
};

const runPrompt = async (prompt) => {
  try {
    const response = await getClient().models.generate({
      model: MODEL,
      contents: prompt,
    });

    return response.text;
  } catch (err) {
    if (err.isApiError) throw err;

    const status = err.status || err.statusCode;
    if (status === 429) {
      throw new ApiError(
        429,
        "AI quota exceeded. Check your Gemini plan/biilling and try again later.",
      );
    }
    if (status === 400 || status === 401 || status === 403) {
      throw new ApiError(
        503,
        "AI request rejected - verify your Gemini_Api_Key is valid.",
      );
    }

    console.error("Gemini request falied:", err.message);
    throw new ApiError(
      502,
      "The AI service is temporaly unavailable. Please try again.",
    );
  }
};

const normalizeTask = (task) => ({
  title: String(task.title || task.name || "")
    .trim()
    .slice(0, 200),
  description: String(task.description || "")
    .trim()
    .slice(0, 1000),
  priority: VALID_PRIORITIES.includes(task.priority) ? task.priority : "medium",
});

const generateTasks = async (goal, count = 6) => {
  const prompt = `
    You are a senior project manager. Break the following project goal into ${count} concrete, actionable Kanban tasks.
    
    Goal: "${goal}"

    Respond ONLY with JSON array. Each item: { "title": string, "description": string (1-2 sentences), "priority": "low"|"medium"|"high"|"urgent"}.
    No markdown, no commentary.`;

  const json = extractJSON(await runPrompt(prompt));
  if (!Array.isArray(json))
    throw new ApiError(502, "AI did not return a task list");

  return json.map(normalizeTask).filter((task) => task.title);
};

const breakdownTask = async (title, description = "", count = 5) => {
  const prompt = `
    Break the following task into ${count} smaller, sequential subtasks.
    Task title: "${title}"
    Task details: "${description || "n/a"}"
    
    Respond ONLY with JSON array. Each item: { "title": string, "description": string (short), "priority": "low"|"medium"|"high"|"urgent"}.
    No markdown, no commentary.`;

  const json = extractJSON(await runPrompt(prompt));
  if (!Array.isArray(json))
    throw new ApiError(502, "AI did not return subtask");

  return json.map(normalizeTask).filter((task) => task.title);
};

const summarizeBoard = async ({ boardTitle, columns }) => {
  const snapshot = columns
    .map((c) => {
      const tasks =
        c.tasks.map((t) => ` - ${t.title} [${t.priority}]`).join("\n") ||
        " (none)";
      return `${c.title} (${c.tasks.length}):\n${tasks}`;
    }).join("\n");

  const prompt = `
    You are a scrum master. Write a concise sprint summary for the Kanban board "${boardTitle}".
    Current board state: ${snapshot}
    
    Respond ONLY with JSON : {
        "headline": string ( one sentence overview ),
        "completed": string[] ( key done items ),
        "inProgress": string[] ( what's actively being worked ),
        "risks": string[] ( blockers/risks/pverdue concerns ),
        "recommendations": string[] ( next priorities )
    }
        
    No markdown, no commentary.`;

  return extractJSON(await runPrompt(prompt));
};

export { generateTasks, breakdownTask, summarizeBoard };
