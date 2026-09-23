/**
 * @file printUtils.js
 * @description Isolated iframe printing utility for ID Cards and Certificates.
 * Supports single-document print and batch grid printing (e.g. 8 ID cards per A4 page).
 */

/**
 * Print a single HTML document string in an isolated iframe.
 * @param {string} htmlContent - The rendered HTML string
 * @param {object} options
 * @param {'portrait' | 'landscape'} options.orientation
 * @param {string} options.title - Document title for print/PDF export
 * @param {'a4' | 'card'} options.pageSize
 */
export function printDocument(htmlContent, options = {}) {
  const {
    orientation = 'portrait',
    title = 'Document',
    pageSize = 'a4',
  } = options;

  // Remove any existing print iframe
  const existingFrame = document.getElementById('rges-print-frame');
  if (existingFrame) {
    existingFrame.remove();
  }

  const iframe = document.createElement('iframe');
  iframe.id = 'rges-print-frame';
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow || iframe.contentDocument;
  const frameDoc = iframe.contentDocument || iframe.contentWindow.document;

  const pageCss = pageSize === 'card'
    ? `@page { size: auto; margin: 0; }`
    : `@page { size: A4 ${orientation}; margin: 0; }`;

  frameDoc.open();
  frameDoc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${title}</title>
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;800&family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
        <style>
          ${pageCss}
          * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          body {
            margin: 0;
            padding: 0;
            background: #fff;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
          }
          @media print {
            body {
              min-height: auto;
              display: block;
            }
          }
        </style>
      </head>
      <body>
        ${htmlContent}
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.focus();
              window.print();
            }, 300);
          };
        </script>
      </body>
    </html>
  `);
  frameDoc.close();

  // Clean up iframe after printing
  setTimeout(() => {
    if (iframe.parentNode) {
      iframe.parentNode.removeChild(iframe);
    }
  }, 60000);
}

/**
 * Print multiple ID cards or certificates in batch.
 * For ID cards, renders an efficient A4 grid sheet (2 columns x 4 rows per page).
 * For certificates, renders one per page with CSS page-break-after.
 * @param {Array<string>} htmlContents - Array of rendered HTML strings
 * @param {object} options
 */
export function printBatchDocuments(htmlContents, options = {}) {
  const {
    type = 'id-card', // 'id-card' or 'certificate'
    title = 'Batch Print',
    orientation = type === 'certificate' ? 'landscape' : 'portrait',
  } = options;

  if (!htmlContents || htmlContents.length === 0) return;

  const existingFrame = document.getElementById('rges-print-frame');
  if (existingFrame) existingFrame.remove();

  const iframe = document.createElement('iframe');
  iframe.id = 'rges-print-frame';
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const frameDoc = iframe.contentDocument || iframe.contentWindow.document;

  let bodyContent = '';

  if (type === 'id-card') {
    // 2-column grid sheet for ID cards
    bodyContent = `
      <div class="cards-grid">
        ${htmlContents.map((html) => `<div class="card-cell">${html}</div>`).join('')}
      </div>
    `;
  } else {
    // Certificates: 1 per page
    bodyContent = htmlContents
      .map((html) => `<div class="cert-page">${html}</div>`)
      .join('');
  }

  frameDoc.open();
  frameDoc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${title}</title>
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;800&family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
        <style>
          @page { size: A4 ${orientation}; margin: 10mm; }
          * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          body { margin: 0; padding: 0; background: #fff; }
          .cards-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
            justify-items: center;
            align-items: center;
          }
          .card-cell {
            page-break-inside: avoid;
            break-inside: avoid;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          .cert-page {
            page-break-after: always;
            break-after: page;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
          }
          .cert-page:last-child {
            page-break-after: avoid;
            break-after: avoid;
          }
        </style>
      </head>
      <body>
        ${bodyContent}
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.focus();
              window.print();
            }, 400);
          };
        </script>
      </body>
    </html>
  `);
  frameDoc.close();

  setTimeout(() => {
    if (iframe.parentNode) {
      iframe.parentNode.removeChild(iframe);
    }
  }, 60000);
}

/**
 * Opens a rendered document in a standalone new browser window/tab with print toolbar.
 * @param {string} htmlContent - The rendered HTML string
 * @param {object} options
 */
export function openDocumentInNewTab(htmlContent, options = {}) {
  const {
    orientation = 'landscape',
    title = 'Official Document',
    pageSize = 'a4',
  } = options;

  const win = window.open('', '_blank');
  if (!win) {
    alert('Pop-up was blocked. Please allow pop-ups for this school portal to open documents in a new tab.');
    return;
  }

  const pageCss = pageSize === 'card'
    ? `@page { size: auto; margin: 0; }`
    : `@page { size: A4 ${orientation}; margin: 0; }`;

  win.document.open();
  win.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${title}</title>
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;800&family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
        <style>
          ${pageCss}
          * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          body {
            margin: 0;
            padding: 0;
            background: #0f172a;
            color: #fff;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .toolbar {
            position: sticky;
            top: 0;
            z-index: 1000;
            width: 100%;
            background: rgba(15, 23, 42, 0.9);
            backdrop-filter: blur(12px);
            border-bottom: 1px solid rgba(51, 65, 85, 0.7);
            padding: 12px 24px;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          .toolbar-title {
            font-family: 'Inter', sans-serif;
            font-size: 13px;
            font-weight: 700;
            color: #f1f5f9;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .toolbar-btn {
            font-family: 'Inter', sans-serif;
            font-size: 12px;
            font-weight: 700;
            padding: 8px 18px;
            border-radius: 10px;
            border: none;
            cursor: pointer;
            transition: all 0.15s ease;
          }
          .btn-print {
            background: #d97706;
            color: #0f172a;
          }
          .btn-print:hover {
            background: #f59e0b;
          }
          .btn-close {
            background: rgba(51, 65, 85, 0.6);
            color: #cbd5e1;
            margin-left: 8px;
          }
          .btn-close:hover {
            background: rgba(51, 65, 85, 0.9);
            color: #fff;
          }
          .canvas-container {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 30px 20px;
            width: 100%;
          }
          @media print {
            body { background: #fff !important; color: #000 !important; }
            .toolbar { display: none !important; }
            .canvas-container { padding: 0 !important; }
          }
        </style>
      </head>
      <body>
        <div class="toolbar">
          <div class="toolbar-title">
            <span style="color:#f59e0b;">★</span>
            <span>${title}</span>
          </div>
          <div>
            <button class="toolbar-btn btn-print" onclick="window.print()">Print / Save as PDF</button>
            <button class="toolbar-btn btn-close" onclick="window.close()">Close Window</button>
          </div>
        </div>
        <div class="canvas-container">
          ${htmlContent}
        </div>
      </body>
    </html>
  `);
  win.document.close();
}

