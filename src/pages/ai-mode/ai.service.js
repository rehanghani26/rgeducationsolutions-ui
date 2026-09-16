/**
 * @file ai.service.js
 * @description Frontend AI Service — API layer for the backend AI API.
 */

import api from "../../services/api.js";

/**
 * Send a chat message to the backend AI service.
 *
 * @param {Array<{role: string, content: string}>} chatHistory - Previous messages
 * @param {string} userPrompt - Current user message
 * @returns {Promise<{reply: string, actionsExecuted: Array}>}
 */
export async function sendAiChatMessage(chatHistory = [], userPrompt) {
  if (!userPrompt?.trim()) {
    throw new Error("Message cannot be empty.");
  }

  const response = await api.post("/ai/chat", {
    message: userPrompt.trim(),
    conversationHistory: chatHistory
      .slice(-20) // send last 20 messages max
      .map((m) => ({
        role: m.role === "model" ? "assistant" : m.role,
        content: m.content || "",
      })),
  });

  const data = response.data;

  if (!data.success) {
    throw new Error(data.reply || data.message || "AI service error.");
  }

  return {
    reply: data.reply || "",
    actionsExecuted: data.toolCalls || [],
  };
}

/**
 * Check AI service health and active provider status.
 * @returns {Promise<{success: boolean, status: string, provider: string, fallback?: string}>}
 */
export async function fetchAiHealth() {
  const response = await api.get("/ai/health");
  return response.data;
}

export default {
  sendAiChatMessage,
  fetchAiHealth,
};
