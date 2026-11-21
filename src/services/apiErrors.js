import axios from "axios";
import { toast } from "react-toastify";

const reportedErrors = new WeakSet();
const pendingToastKey = "rges_api_error_toast";
const defaultMessage = "The request could not be completed.";
const statusMessages = {
  401: "Authentication failed. Please sign in again.",
  403: "You do not have permission to complete this request.",
  404: "The server could not find the requested endpoint or record (404).",
  429: "Too many requests. Please try again shortly.",
  500: "The server could not complete the request.",
  502: "The server is temporarily unavailable.",
  503: "The server is temporarily unavailable.",
  504: "The server took too long to respond.",
};

function readableText(value) {
  if (typeof value !== "string") return "";
  const text = value.trim();
  return text.startsWith("<") ? "" : text;
}

function responseMessage(data) {
  if (!data || typeof data !== "object") return readableText(data);
  const message = readableText(data.message)
    || readableText(data.error?.message)
    || readableText(data.error)
    || readableText(data.data?.message)
    || readableText(data.detail)
    || readableText(data.reply)
    || readableText(data.errors);
  if (message) return message;

  const details = Array.isArray(data) ? data : data.errors;
  if (!details || typeof details !== "object") return "";
  return Object.values(details)
    .flat()
    .map((error) => readableText(error?.message) || readableText(error?.msg) || readableText(error))
    .filter(Boolean)
    .join(" ");
}

export async function normalizeApiError(error) {
  const response = error.response;
  let payload = response?.data;
  if (typeof Blob !== "undefined" && payload instanceof Blob) {
    const text = await payload.text().catch(() => "");
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }
  const status = response?.status;
  error.message = responseMessage(payload)
    || statusMessages[status]
    || (status ? `The server rejected the request (HTTP ${status}).` : "")
    || (error.code === "ERR_NETWORK" ? "Could not reach the server. Check your connection and try again." : "")
    || (["ECONNABORTED", "ETIMEDOUT"].includes(error.code) ? "The request timed out. Please try again." : "")
    || readableText(error.message)
    || defaultMessage;
  if (status && error.status == null) error.status = status;
  return error;
}

function markReported(error) {
  if (!error || typeof error !== "object") return true;
  if (reportedErrors.has(error)) return false;
  reportedErrors.add(error);
  return true;
}

function show(message) {
  toast.error(message, { toastId: `api-error:${message}` });
}

// Page handlers can pass the same error or failure response to avoid a second toast.
export function notifyApiError(error, fallback) {
  if (axios.isCancel(error) || !markReported(error)) return;
  const message = responseMessage(error?.response?.data)
    || (error instanceof Error ? "" : responseMessage(error))
    || readableText(fallback)
    || readableText(error?.message)
    || defaultMessage;
  show(message);
}

export function notifyAfterRedirect(error, path) {
  if (axios.isCancel(error) || !markReported(error)) return;
  sessionStorage.setItem(pendingToastKey, error.message);
  window.location.href = path;
}

export function showPendingApiError() {
  const message = sessionStorage.getItem(pendingToastKey);
  if (message) {
    sessionStorage.removeItem(pendingToastKey);
    show(message);
  }
}
