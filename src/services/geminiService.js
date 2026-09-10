/**
 * @file geminiService.js
 * @description Re-exports the active backend AI service.
 *
 * All AI logic (tool execution, provider selection, API keys) lives on the
 * server (server/ai/). This file is kept as a compatibility shim in case
 * any future code imports from here.
 *
 * Use systemAiService.js directly for all new code.
 */

export * from './systemAiService.js';
export { default } from './systemAiService.js';
