export * from "./systemAiService.js";
export { default } from "./systemAiService.js";


/* ─────────────────────────────────────────────────────────────────────
 * GEMINI MODEL REGISTRY
 *
 * Confirmed API version routing (per Google AI docs):
 *   /v1/      → Stable models: gemini-1.5-flash, gemini-1.5-pro
 *   /v1beta/  → Preview/exp models: gemini-2.0-flash-exp
 *
 * Error: "not found for API version v1beta" means the model needs /v1/
 * ───────────────────────────────────────────────────────────────────── */
export const GEMINI_MODELS = [
  {
    id: "gemini-1.5-flash",
    name: "Gemini 1.5 Flash (Recommended)",
    badge: "Fastest",
    apiVersion: "v1", // ✅ MUST use v1
  },
  {
    id: "gemini-1.5-flash-latest",
    name: "Gemini 1.5 Flash Latest",
    badge: "Latest",
    apiVersion: "v1", // ✅ MUST use v1
  },
  {
    id: "gemini-2.0-flash-exp",
    name: "Gemini 2.0 Flash (Experimental)",
    badge: "New",
    apiVersion: "v1beta", // ✅ experimental — v1beta only
  },
  {
    id: "gemini-1.5-pro",
    name: "Gemini 1.5 Pro (Deep Reasoning)",
    badge: "Pro",
    apiVersion: "v1", // ✅ MUST use v1
  },
];

const GEMINI_BASE = "https://generativelanguage.googleapis.com";

/**
 * Returns the correct full endpoint URL for a given model ID.
 *   gemini-1.5-flash     → /v1/models/gemini-1.5-flash:generateContent
 *   gemini-2.0-flash-exp → /v1beta/models/gemini-2.0-flash-exp:generateContent
 */
function buildEndpoint(modelId, apiKey) {
  const m = GEMINI_MODELS.find((m) => m.id === modelId);
  const version = m?.apiVersion ?? "v1";
  return `${GEMINI_BASE}/${version}/models/${modelId}:generateContent?key=${apiKey}`;
}

const STORAGE_KEY_API_KEY = "GEMINI_API_KEY";

/**
 * Get configured Gemini API key (localStorage → env var)
 */
export function getGeminiApiKey() {
  return (
    localStorage.getItem(STORAGE_KEY_API_KEY) ||
    import.meta.env.VITE_GEMINI_API_KEY ||
    ""
  );
}

/**
 * Store Gemini API key in localStorage
 */
export function setGeminiApiKey(key) {
  if (!key) {
    localStorage.removeItem(STORAGE_KEY_API_KEY);
  } else {
    localStorage.setItem(STORAGE_KEY_API_KEY, key.trim());
  }
}

/**
 * Check if Gemini API key exists
 */
export function hasGeminiApiKey() {
  return Boolean(getGeminiApiKey());
}

/**
 * Get selected Gemini model — with automatic migration of stale/invalid IDs
 */
export function getGeminiModel() {
  let stored = localStorage.getItem(STORAGE_KEY_MODEL) || DEFAULT_MODEL;
  // Migrate any old model IDs that are no longer valid
  const MIGRATIONS = {
    "gemini-2.0-flash": "gemini-2.0-flash-exp",
  };
  if (MIGRATIONS[stored]) {
    stored = MIGRATIONS[stored];
    localStorage.setItem(STORAGE_KEY_MODEL, stored);
  }
  return stored;
}

/**
 * Save selected Gemini model
 */
export function setGeminiModel(model) {
  localStorage.setItem(STORAGE_KEY_MODEL, model);
}

/**
 * Build System Instruction for School ERP AI
 */
function getSystemInstruction(user) {
  const userName = user?.name || "Administrator";
  const userRole = user?.role || "Admin";

  return `You are "RGES ERP AI", an intelligent, high-precision executive AI Assistant for RG EduCore / RGES ERP School Management ERP.
Current logged-in user: ${userName} (Role: ${userRole}).

You have real-time access to the school ERP system through executable function tools.
You can:
- Query, list, and search enrolled students (getStudents).
- Register / enroll new students with their full information (createStudent).
- View, list, and add teachers and staff (getTeachers, createTeacher).
- Manage user accounts, inspect admin privileges, create accounts (getUsers, createUser).
- Check today's attendance metrics and absent counts (getAttendanceStats).
- Inspect pending fees, collections, and financial overviews (getFeesOverview).
- Check inventory stock levels, equipment, and low-stock alerts (getInventoryStatus, createInventoryItem).
- Look up academic grades, sections, and subjects (getAcademicClasses).
- Retrieve executive dashboard stats (getDashboardOverview).
- Dynamically navigate the user's interface to any page in the ERP (navigateTo).

CRITICAL OPERATIONAL RULES:
1. Always call the relevant tool whenever the user asks for actions, records, creation, or lists.
2. When creating a student, teacher, or user, if crucial info like class or email is missing, infer a sensible default or ask, but prefer taking immediate action when parameters are clear.
3. Formulate your answers with stunning markdown formatting: use bullet points, bold headers, and structured markdown tables for lists of items.
4. After creating a record or executing an action, celebrate the success with clear details of what was created and include actionable next steps.
5. Be concise, polite, professional, and proactive in offering helpful insights.`;
}

/**
 * Formats chat messages for Gemini API
 */
function formatMessagesForGemini(chatHistory) {
  return chatHistory.map((msg) => ({
    role: msg.role === "user" ? "user" : "model",
    parts: [{ text: msg.content || "" }],
  }));
}

/**
 * Sends a chat message to Google Gemini API with automatic Tool Calling & Multi-turn execution
 *
 * @param {Array} chatHistory - Prior conversation items [{ role: 'user'|'model', content: string }]
 * @param {string} userPrompt - Current prompt text
 * @param {object} context - Execution context { navigate, user }
 * @returns {Promise<{ reply: string, actionsExecuted: Array }>}
 */
export async function sendGeminiChatMessage(
  chatHistory,
  userPrompt,
  context = {}
) {
  const apiKey = getGeminiApiKey();
  const model = getGeminiModel();

  if (!apiKey) {
    throw new Error(
      'AI API Key is not configured. Please check the built-in configuration.'
    );
  }

  // ✅ Per-model versioned endpoint (v1 for stable, v1beta for experimental)
  const endpoint = buildEndpoint(model, apiKey);

  // Prepare Gemini conversation contents
  const contents = formatMessagesForGemini(chatHistory);
  contents.push({
    role: "user",
    parts: [{ text: userPrompt }],
  });

  const requestBody = {
    systemInstruction: {
      parts: [{ text: getSystemInstruction(context.user) }],
    },
    contents,
    tools: [
      {
        functionDeclarations: GEMINI_ERP_TOOLS,
      },
    ],
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 2048,
    },
  };

  const actionsExecuted = [];

  // Initial API call
  let response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message =
      `AI request failed with status ${response.status} (${response.statusText})`;
    throw new Error(message);
  }

  let data = await response.json();
  let candidate = data.candidates?.[0];
  let parts = candidate?.content?.parts || [];

  // Check for Function Call in the response
  const functionCallPart = parts.find((p) => p.functionCall);

  if (functionCallPart) {
    const { name: toolName, args } = functionCallPart.functionCall;

    // Execute the ERP tool action
    const toolResult = await executeAiAction(toolName, args, context);

    actionsExecuted.push({
      toolName,
      args,
      result: toolResult,
      timestamp: new Date().toISOString(),
    });

    // Send function response back to Gemini to get natural language synthesis
    const followUpContents = [
      ...contents,
      {
        role: "model",
        parts: [{ functionCall: { name: toolName, args } }],
      },
      {
        role: "user",
        parts: [
          {
            functionResponse: {
              name: toolName,
              response: {
                name: toolName,
                content: toolResult,
              },
            },
          },
        ],
      },
    ];

    const followUpBody = {
      systemInstruction: {
        parts: [{ text: getSystemInstruction(context.user) }],
      },
      contents: followUpContents,
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 2048,
      },
    };

    const followUpResponse = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify(followUpBody),
    });

    if (followUpResponse.ok) {
      const followUpData = await followUpResponse.json();
      const followUpParts = followUpData.candidates?.[0]?.content?.parts || [];
      const synthesizedText = followUpParts.map((p) => p.text || "").join("");

      return {
        reply: synthesizedText || "Action completed successfully.",
        actionsExecuted,
      };
    }
  }

  // Pure text answer
  const textOutput = parts.map((p) => p.text || "").join("");
  return {
    reply:
      textOutput || "I processed your request, but received no text response.",
    actionsExecuted,
  };
}

export default {
  getGeminiApiKey,
  setGeminiApiKey,
  hasGeminiApiKey,
  getGeminiModel,
  setGeminiModel,
  GEMINI_MODELS,
  sendGeminiChatMessage,
};
