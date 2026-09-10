/**
 * @file systemAiService.js
 * @description Frontend AI Service — thin wrapper over the backend AI API.
 *
 * All AI logic, tool execution, provider selection, and API keys now live
 * on the backend (server/ai/). This file simply sends the user's message
 * to the backend chat endpoint and returns the response.
 *
 * No API keys are stored or transmitted from the frontend.
 */

import api from './api.js';

/**
 * Send a chat message to the backend AI service.
 *
 * @param {Array<{role: string, content: string}>} chatHistory - Previous messages
 * @param {string} userPrompt - Current user message
 * @param {object} [context] - Optional context (kept for backwards compat, not used)
 *
 * @returns {Promise<{reply: string, actionsExecuted: Array}>}
 */
export async function sendAiChatMessage(chatHistory = [], userPrompt, context = {}) {
  if (!userPrompt?.trim()) {
    throw new Error('Message cannot be empty.');
  }

  const response = await api.post('/ai/chat', {
    message: userPrompt.trim(),
    conversationHistory: chatHistory
      .slice(-20) // send last 20 messages max
      .map((m) => ({
        role: m.role === 'model' ? 'assistant' : m.role,
        content: m.content || '',
      })),
  });

  const data = response.data;

  if (!data.success) {
    throw new Error(data.reply || data.message || 'AI service error.');
  }

  return {
    reply: data.reply || '',
    actionsExecuted: data.toolCalls || [],
  };
}

// ─── Legacy exports (kept to avoid breaking any other imports) ────────────────

export const AI_CONFIG = {};
export const GEMINI_MODELS = [];
export function getSystemInstruction() { return ''; }
