export function spreadsheetCsv(rows) {
  return rows.map((row) => row.map((cell) => '"' + String(cell ?? '').replaceAll('"', '""') + '"').join(',')).join('\r\n');
}

export function downloadSpreadsheetFile(blob, name) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

export const loadSpreadsheet = () => import('xlsx');

function readCsv(text) {
  const rows = [];
  let cells = [];
  let field = '';
  let quoted = false;
  let closed = false;
  let line = 1;
  let rowNumber = 1;
  const pushField = () => {
    cells.push(field);
    field = '';
    closed = false;
  };
  const pushRow = () => {
    pushField();
    rows.push({ number: rowNumber, cells });
    cells = [];
  };

  const input = text.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
  for (let index = 0; index < input.length; index++) {
    const char = input[index];
    if (quoted) {
      if (char === '"' && input[index + 1] === '"') {
        field += '"';
        index++;
      } else if (char === '"') {
        quoted = false;
        closed = true;
      } else {
        field += char;
        if (char === '\n') line++;
      }
    } else if (char === ',') {
      pushField();
    } else if (char === '\n') {
      pushRow();
      rowNumber = ++line;
    } else if (char === '"' && field.trim() === '' && !closed) {
      field = '';
      quoted = true;
    } else if (!(closed && /\s/.test(char))) {
      if (closed || char === '"') throw new Error('Invalid CSV quoting on line ' + line + '.');
      field += char;
    }
  }
  if (quoted) throw new Error('Unclosed quoted cell starting on row ' + rowNumber + '.');
  if (field || cells.length || closed) pushRow();
  return rows;
}

export const asText = (value) => String(value ?? '').trim();
export const spreadsheetIdentifier = (value) => asText(value).replace(/^'(?=[+\d-])/, '').replace(/\.0$/, '');

export function spreadsheetDate(value, key, date1904) {
  let input = asText(value);
  if (typeof value === 'number' && value >= 0 && value < 2958466) {
    const days = Math.floor(value);
    // Excel's 1900 calendar includes a fictitious February 29 at serial 60.
    if (!date1904 && days === 60) throw new Error(key + ' contains an invalid Excel date.');
    const unixEpoch = date1904 ? 24107 : days < 60 ? 25568 : 25569;
    input = new Date((days - unixEpoch) * 86400000).toISOString().slice(0, 10);
  } else {
    const legacy = input.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
    if (legacy) input = [legacy[3], legacy[2].padStart(2, '0'), legacy[1].padStart(2, '0')].join('-');
  }
  const date = new Date(input + 'T00:00:00Z');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input) || Number.isNaN(date.valueOf()) || date.toISOString().slice(0, 10) !== input) {
    throw new Error(key + ' must be a valid date in YYYY-MM-DD format.');
  }
  return input;
}

export function spreadsheetBoolean(input, key) {
  const value = asText(input).toLowerCase();
  if (['true', 'yes', '1'].includes(value)) return true;
  if (['false', 'no', '0'].includes(value)) return false;
  throw new Error(key + ' must be true or false.');
}

export async function readSpreadsheet(file, preferredSheet) {
  let rows;
  let date1904 = false;
  if (/\.(xlsx|xls)$/i.test(file.name)) {
    const XLSX = await loadSpreadsheet();
    if (/\.xls$/i.test(file.name)) XLSX.set_cptable(await import('xlsx/dist/cpexcel'));
    const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' });
    date1904 = Boolean(workbook.Workbook?.WBProps?.date1904);
    const sheetName = workbook.SheetNames.find((name) => name.trim().toLowerCase() === preferredSheet?.toLowerCase()) || workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    if (!sheet?.['!ref']) throw new Error('The worksheet is empty.');
    const rowOffset = XLSX.utils.decode_range(sheet['!ref']).s.r;
    rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '', raw: true, blankrows: true })
      .map((cells, index) => ({ number: rowOffset + index + 1, cells }));
  } else if (/\.(csv|txt)$/i.test(file.name)) {
    rows = readCsv(await file.text());
  } else {
    throw new Error('Choose a CSV, XLSX, or XLS file.');
  }
  return { rows, date1904 };
}
