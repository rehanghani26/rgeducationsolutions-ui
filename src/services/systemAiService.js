/**
 * @file systemAiService.js
 * @description Universal System AI Service supporting both OpenAI ChatGPT and Google Gemini.
 *
 * Provides:
 * - Direct ChatGPT (OpenAI) API integration with native tool/function calling
 * - Google Gemini API integration
 * - Automatic provider detection based on API Key format (e.g., 'sk-...' => OpenAI ChatGPT)
 * - Real-time ERP tool execution (Students, Teachers, Attendance, Fees, Inventory, Navigation)
 */

import { GEMINI_ERP_TOOLS, executeAiAction } from "./aiApiRegistry.js";
import Groq from "groq-sdk";

/* ─────────────────────────────────────────────────────────────────────
 * CONFIGURATION & DEFAULT KEYS
 *
 * You can set your API key here directly, or define it in your .env file:
 * VITE_OPENAI_API_KEY=sk-...
 * VITE_GEMINI_API_KEY=...
 * ───────────────────────────────────────────────────────────────────── */
export const AI_CONFIG = {
  // Primary Provider: 'auto' | 'groq' | 'openai' | 'gemini'
  provider: "auto",

  // GroqCloud Configuration (openai/gpt-oss-20b)
  groq: {
    apiKey:
      import.meta.env.VITE_GROQ_API_KEY ||
      localStorage.getItem("GROQ_API_KEY") ||
      "",
    model:
      import.meta.env.VITE_GROQ_MODEL ||
      "openai/gpt-oss-20b",
    baseUrl: "https://api.groq.com/openai/v1",
  },



  // OpenAI (ChatGPT) Configuration
  openai: {
    apiKey:
      import.meta.env.VITE_OPENAI_API_KEY ||
      localStorage.getItem("OPENAI_API_KEY") ||
      "",
    model:
      import.meta.env.VITE_OPENAI_MODEL ||
      localStorage.getItem("OPENAI_MODEL") ||
      "gpt-4o-mini", // 'gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo'
    baseUrl: "https://api.openai.com/v1",
  },

  // Gemini Configuration
  gemini: {
    apiKey:
      import.meta.env.VITE_GEMINI_API_KEY ||
      localStorage.getItem("GEMINI_API_KEY") ||
      "",
    model:
      localStorage.getItem("GEMINI_SELECTED_MODEL") ||
      "gemini-1.5-flash",
    baseUrl: "https://generativelanguage.googleapis.com",
  },
};

// Clean any stale legacy keys or models from localStorage if present
try {
  const stale = localStorage.getItem("GEMINI_API_KEY");
  if (stale && stale.startsWith("AQ.Ab8")) {
    localStorage.removeItem("GEMINI_API_KEY");
  }
  const staleGroq = localStorage.getItem("GROQ_MODEL");
  if (
    staleGroq === "llama-3.3-70b-versatile" ||
    staleGroq === "llama-3.1-8b-instant"
  ) {
    localStorage.removeItem("GROQ_MODEL");
  }
} catch {
  // ignore in non-browser environments
}

/* ─────────────────────────────────────────────────────────────────────
 * TOOL CONVERTER: Convert Gemini Tool Schema to OpenAI/Groq Function Format
 * ───────────────────────────────────────────────────────────────────── */
function convertGeminiSchemaToOpenAi(schema) {
  if (!schema || typeof schema !== "object") {
    return { type: "object", properties: {} };
  }
  const converted = { ...schema };
  if (converted.type && typeof converted.type === "string") {
    converted.type = converted.type.toLowerCase();
  } else {
    converted.type = "object";
  }
  if (!converted.properties) {
    converted.properties = {};
  } else {
    const newProps = {};
    for (const [key, prop] of Object.entries(converted.properties)) {
      newProps[key] = convertGeminiSchemaToOpenAi(prop);
    }
    converted.properties = newProps;
  }
  if (converted.items) {
    converted.items = convertGeminiSchemaToOpenAi(converted.items);
  }
  return converted;
}


const OPENAI_ERP_TOOLS = GEMINI_ERP_TOOLS.map((tool) => ({
  type: "function",
  function: {
    name: tool.name,
    description: tool.description,
    parameters: convertGeminiSchemaToOpenAi(tool.parameters),
  },
}));

/* ─────────────────────────────────────────────────────────────────────
 * SYSTEM INSTRUCTION / PROMPT FOR SCHOOL ERP AI
 * ───────────────────────────────────────────────────────────────────── */
export function getSystemInstruction(user) {
  const userName = user?.name || "Administrator";
  const userRole = user?.role || "Admin";

  return `You are "System AI", an intelligent, executive AI Assistant for RG EduCore / RGES ERP School Management System.
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

/* ─────────────────────────────────────────────────────────────────────
 * OPENAI & GROQCLOUD COMPATIBLE EXECUTION ENGINE
 * ───────────────────────────────────────────────────────────────────── */
async function sendOpenAiCompatibleChatMessage(
  chatHistory,
  userPrompt,
  context = {},
  providerConfig = AI_CONFIG.groq
) {
  const apiKey = providerConfig.apiKey;
  const model = providerConfig.model;
  const baseUrl = providerConfig.baseUrl;
  const providerName = providerConfig === AI_CONFIG.groq ? "GroqCloud" : "OpenAI";

  if (!apiKey) {
    throw new Error(
      `${providerName} API Key is not configured. Please set your key in .env or systemAiService.js.`
    );
  }

  // Format messages
  const messages = [
    {
      role: "system",
      content: getSystemInstruction(context.user),
    },
    ...chatHistory.map((msg) => ({
      role: msg.role === "user" ? "user" : "assistant",
      content: msg.content || "",
    })),
    {
      role: "user",
      content: userPrompt,
    },
  ];

  const actionsExecuted = [];

  // Dynamically discover what models this Groq key actually has access to
  let candidateModels = [model, "openai/gpt-oss-20b"];
  if (providerConfig === AI_CONFIG.groq) {
    try {
      const modelsRes = await fetch(`${baseUrl}/models`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      if (modelsRes.ok) {
        const modelsData = await modelsRes.json();
        const activeIds = (modelsData.data || [])
          .map((m) => m.id)
          .filter(
            (id) =>
              id &&
              !id.includes("whisper") &&
              !id.includes("embed") &&
              !id.includes("guard")
          );
        if (activeIds.length > 0) {
          console.log("⚡ [GroqCloud] Available models for your API key:", activeIds);
          candidateModels = [
            "openai/gpt-oss-20b",
            model,
            ...activeIds,
            "llama3-8b-8192",
            "llama3-70b-8192",
            "mixtral-8x7b-32768",
            "gemma2-9b-it",
          ].filter((m, i, arr) => m && arr.indexOf(m) === i);
        }
      }
    } catch (discoveryErr) {
      console.warn("Groq dynamic model fetch failed, using fallback list:", discoveryErr);
    }
    if (candidateModels.length <= 2) {
      candidateModels = [
        "openai/gpt-oss-20b",
        model,
        "llama3-8b-8192",
        "llama3-70b-8192",
        "mixtral-8x7b-32768",
        "gemma2-9b-it",
      ].filter((m, i, arr) => m && arr.indexOf(m) === i);
    }
  }


  let response = null;
  let activeModel = candidateModels[0];
  let lastErrorData = null;

  for (const candidateModel of candidateModels) {
    activeModel = candidateModel;
    
    // First attempt: with function tools
    let payload = {
      model: candidateModel,
      messages,
      tools: OPENAI_ERP_TOOLS,
      tool_choice: "auto",
      temperature: 0.4,
    };

    response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      break;
    }

    const errData = await response.json().catch(() => ({}));
    lastErrorData = errData;
    const msg = (errData?.error?.message || "").toLowerCase();
    const code = errData?.error?.code || "";

    // If model does not support tool calling, retry this same model without tools
    if (msg.includes("tool") || msg.includes("function")) {
      delete payload.tools;
      delete payload.tool_choice;
      const retryWithoutTools = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(payload),
      });
      if (retryWithoutTools.ok) {
        response = retryWithoutTools;
        break;
      }
    }

    // If model not found or no access, continue to next candidate model
    if (
      code === "model_not_found" ||
      msg.includes("does not exist") ||
      msg.includes("access to it") ||
      response.status === 404
    ) {
      continue;
    } else {
      break;
    }
  }


  if (!response || !response.ok) {
    // Fallback attempt: OpenAI responses.create format (/responses)
    try {
      const respEndpoint = `${baseUrl}/responses`;
      const respRes = await fetch(respEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: model || "openai/gpt-oss-20b",
          input: userPrompt,
        }),
      });
      if (respRes.ok) {
        const respData = await respRes.json();
        const outText =
          respData.output_text ||
          respData.output?.[0]?.content?.[0]?.text ||
          respData.output?.[0]?.text ||
          respData.choices?.[0]?.message?.content ||
          "";
        if (outText) {
          return {
            reply: outText,
            actionsExecuted: [],
          };
        }
      }
    } catch (respErr) {
      console.warn("Responses API fallback attempt failed:", respErr);
    }

    const errorMsg =
      lastErrorData?.error?.message ||
      `${providerName} API request failed with status ${response?.status || 500} (${response?.statusText || "Error"})`;
    throw new Error(errorMsg);
  }


  const data = await response.json();
  const choice = data.choices?.[0];
  const choiceMessage = choice?.message;

  if (!choiceMessage) {
    throw new Error(`No response received from ${providerName}.`);
  }

  // Check if model wants to execute ERP function tools
  if (choiceMessage.tool_calls && choiceMessage.tool_calls.length > 0) {
    const toolResultMessages = [];

    for (const toolCall of choiceMessage.tool_calls) {
      const toolName = toolCall.function.name;
      let args = {};
      try {
        args = JSON.parse(toolCall.function.arguments || "{}");
      } catch {
        args = {};
      }

      // Execute ERP tool action
      const toolResult = await executeAiAction(toolName, args, context);

      actionsExecuted.push({
        toolName,
        args,
        result: toolResult,
        timestamp: new Date().toISOString(),
      });

      toolResultMessages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        content: JSON.stringify(toolResult),
      });
    }

    // Send tool execution results back to LLM for final natural synthesis
    const followUpMessages = [
      ...messages,
      choiceMessage,
      ...toolResultMessages,
    ];

    const followUpResponse = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: activeModel,
        messages: followUpMessages,
        temperature: 0.4,
      }),
    });


    if (followUpResponse.ok) {
      const followUpData = await followUpResponse.json();
      const followUpReply =
        followUpData.choices?.[0]?.message?.content ||
        "Action completed successfully.";
      return {
        reply: followUpReply,
        actionsExecuted,
      };
    }
  }

  // Pure text answer
  return {
    reply: choiceMessage.content || "Action processed successfully.",
    actionsExecuted,
  };
}

async function sendOpenAiChatMessage(chatHistory, userPrompt, context = {}) {
  return sendOpenAiCompatibleChatMessage(chatHistory, userPrompt, context, AI_CONFIG.openai);
}

async function sendGroqChatMessage(chatHistory, userPrompt, context = {}) {
  const apiKey = AI_CONFIG.groq.apiKey;
  const model = AI_CONFIG.groq.model || "openai/gpt-oss-20b";

  if (!apiKey) {
    throw new Error(
      "Groq API Key is not configured. Please set VITE_GROQ_API_KEY in .env."
    );
  }

  try {
    const groq = new Groq({
      apiKey,
      dangerouslyAllowBrowser: true,
    });

    const messages = [
      {
        role: "system",
        content: getSystemInstruction(context.user),
      },
      ...chatHistory.map((msg) => ({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.content || "",
      })),
      {
        role: "user",
        content: userPrompt,
      },
    ];

    const actionsExecuted = [];

    // Attempt completion with Groq SDK
    let chatCompletion;
    try {
      chatCompletion = await groq.chat.completions.create({
        messages,
        model,
        tools: OPENAI_ERP_TOOLS,
        tool_choice: "auto",
        temperature: 0.4,
      });
    } catch (errWithTools) {
      // If tools aren't supported on this model, retry plain completion
      const msg = (errWithTools?.message || "").toLowerCase();
      if (
        msg.includes("tool") ||
        msg.includes("function") ||
        msg.includes("support")
      ) {
        chatCompletion = await groq.chat.completions.create({
          messages,
          model,
          temperature: 0.4,
        });
      } else {
        throw errWithTools;
      }
    }

    const choiceMessage = chatCompletion.choices?.[0]?.message;
    if (!choiceMessage) {
      throw new Error("No response returned from Groq SDK.");
    }

    // Check if tools were executed
    if (choiceMessage.tool_calls && choiceMessage.tool_calls.length > 0) {
      const toolResultMessages = [];

      for (const toolCall of choiceMessage.tool_calls) {
        const toolName = toolCall.function.name;
        let args = {};
        try {
          args = JSON.parse(toolCall.function.arguments || "{}");
        } catch {
          args = {};
        }

        const toolResult = await executeAiAction(toolName, args, context);
        actionsExecuted.push({
          toolName,
          args,
          result: toolResult,
          timestamp: new Date().toISOString(),
        });

        toolResultMessages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify(toolResult),
        });
      }

      const followUpMessages = [
        ...messages,
        choiceMessage,
        ...toolResultMessages,
      ];

      const followUpCompletion = await groq.chat.completions.create({
        messages: followUpMessages,
        model,
        temperature: 0.4,
      });

      return {
        reply:
          followUpCompletion.choices?.[0]?.message?.content ||
          "Action completed successfully.",
        actionsExecuted,
      };
    }

    return {
      reply: choiceMessage.content || "Action processed successfully.",
      actionsExecuted,
    };
  } catch (sdkError) {
    console.warn(
      "Groq SDK encountered an error, trying universal fallback:",
      sdkError
    );
    return sendOpenAiCompatibleChatMessage(
      chatHistory,
      userPrompt,
      context,
      AI_CONFIG.groq
    );
  }
}



/* ─────────────────────────────────────────────────────────────────────
 * GEMINI EXECUTION ENGINE
 * ───────────────────────────────────────────────────────────────────── */
async function sendGeminiChatMessage(chatHistory, userPrompt, context = {}) {
  const apiKey = AI_CONFIG.gemini.apiKey;
  const model = AI_CONFIG.gemini.model;

  if (!apiKey) {
    throw new Error(
      "Gemini API Key is not configured. Please set VITE_GEMINI_API_KEY in your .env or insert your API key in systemAiService.js."
    );
  }

  const contents = chatHistory.map((msg) => ({
    role: msg.role === "user" ? "user" : "model",
    parts: [{ text: msg.content || "" }],
  }));
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

  const candidateEndpoints = [
    `${AI_CONFIG.gemini.baseUrl}/v1/models/${model}:generateContent?key=${apiKey}`,
    `${AI_CONFIG.gemini.baseUrl}/v1beta/models/${model}:generateContent?key=${apiKey}`,
    `${AI_CONFIG.gemini.baseUrl}/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    `${AI_CONFIG.gemini.baseUrl}/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
    `${AI_CONFIG.gemini.baseUrl}/v1/models/gemini-1.5-pro:generateContent?key=${apiKey}`,
  ];

  let response = null;
  let activeEndpoint = candidateEndpoints[0];

  let lastErrorData = null;

  for (const ep of candidateEndpoints) {
    activeEndpoint = ep;
    response = await fetch(ep, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify(requestBody),
    });

    if (response.ok) {
      break;
    }

    if (response.status === 404) {
      // Model or version not found on this endpoint, try next candidate
      continue;
    } else {
      // Different error (e.g. 400 invalid key, 429 quota, etc.) — stop and throw
      lastErrorData = await response.json().catch(() => ({}));
      break;
    }
  }

  if (!response || !response.ok) {
    const errorData = lastErrorData || (await response?.json().catch(() => ({}))) || {};
    const message =
      errorData?.error?.message ||
      `AI request failed with status ${response?.status || 500} (${response?.statusText || "Error"})`;
    throw new Error(message);
  }

  const data = await response.json();
  const candidate = data.candidates?.[0];
  const parts = candidate?.content?.parts || [];

  const functionCallPart = parts.find((p) => p.functionCall);

  if (functionCallPart) {
    const { name: toolName, args } = functionCallPart.functionCall;
    const toolResult = await executeAiAction(toolName, args, context);

    actionsExecuted.push({
      toolName,
      args,
      result: toolResult,
      timestamp: new Date().toISOString(),
    });

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

    const followUpResponse = await fetch(activeEndpoint, {
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

  const textOutput = parts.map((p) => p.text || "").join("");
  return {
    reply:
      textOutput || "I processed your request, but received no text response.",
    actionsExecuted,
  };
}

/* ─────────────────────────────────────────────────────────────────────
 * UNIFIED DISPATCHER (AUTO DETECT GROQ, OPENAI, OR GEMINI)
 * ───────────────────────────────────────────────────────────────────── */
export async function sendAiChatMessage(
  chatHistory,
  userPrompt,
  context = {}
) {
  // 1. Check GroqCloud (Highest priority: key starts with "gsk_" or provider === "groq")
  const groqKey = AI_CONFIG.groq.apiKey;
  const isExplicitGroq = AI_CONFIG.provider === "groq";
  const isGroqKey = Boolean(groqKey && groqKey.startsWith("gsk_"));

  if (isExplicitGroq || isGroqKey) {
    return sendGroqChatMessage(chatHistory, userPrompt, context);
  }

  // 2. Check OpenAI / ChatGPT (key starts with "sk-" or provider === "openai")
  const openaiKey = AI_CONFIG.openai.apiKey;
  const isExplicitOpenAi = AI_CONFIG.provider === "openai";
  const isOpenAiKey = Boolean(openaiKey && openaiKey.startsWith("sk-"));

  if (isExplicitOpenAi || isOpenAiKey) {
    return sendOpenAiChatMessage(chatHistory, userPrompt, context);
  }

  // 3. Fallback to Gemini
  return sendGeminiChatMessage(chatHistory, userPrompt, context);
}

export {
  sendGroqChatMessage,
  sendOpenAiChatMessage,
  sendGeminiChatMessage,
};

export default {
  AI_CONFIG,
  sendAiChatMessage,
  sendGroqChatMessage,
  sendOpenAiChatMessage,
  sendGeminiChatMessage,
};

