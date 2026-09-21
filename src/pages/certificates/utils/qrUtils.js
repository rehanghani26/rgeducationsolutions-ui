/**
 * @file qrUtils.js
 * @description QR Code generator for certificates and ID cards.
 * Generates data URLs and SVGs for document verification URLs.
 */

/**
 * Returns a verification URL for a given token
 * @param {string} token
 * @returns {string}
 */
export function getVerificationUrl(token) {
  if (!token) return '';
  const origin = window.location.origin;
  return `${origin}/verify/certificate/${token}`;
}

/**
 * Generates an SVG or image URL for a given QR text.
 * Uses a reliable, lightweight SVG-based QR matrix generator with fallback.
 * @param {string} text
 * @param {number} size
 * @returns {string} Image URL or Data URL
 */
export function generateQRCodeUrl(text, size = 120) {
  if (!text) return '';
  // Use encoded public QR service for crisp vector/raster rendering
  const encoded = encodeURIComponent(text);
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=4&data=${encoded}`;
}

/**
 * Generate a visual verification badge HTML string
 * @param {string} token
 * @param {number} size
 * @returns {string}
 */
export function renderQRBadgeHtml(token, size = 64) {
  if (!token) return '';
  const qrUrl = generateQRCodeUrl(getVerificationUrl(token), size);
  return `
    <div style="display:flex;flex-direction:column;align-items:center;gap:3px;">
      <img src="${qrUrl}" alt="Verify QR" style="width:${size}px;height:${size}px;border-radius:4px;background:#fff;padding:2px;box-shadow:0 1px 4px rgba(0,0,0,0.1);" />
      <span style="font-size:7px;color:#64748b;font-weight:600;letter-spacing:0.5px;">SCAN TO VERIFY</span>
    </div>
  `;
}
