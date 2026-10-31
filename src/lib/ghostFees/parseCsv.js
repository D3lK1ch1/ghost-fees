// Reads a bank CSV export into normalised transactions.

const DATE_HEADER = /^(date|transaction date|value date|posted date|date posted|process date)$/i;
const DESC_HEADER = /(description|narrative|details|detail|memo|particulars|merchant|transaction)$/i;
const AMOUNT_HEADER = /^(amount|amount aud|transaction amount|value|net amount)$/i;
const DEBIT_HEADER = /(debit|withdrawal|withdrawals|money out|paid out|outflow)/i;
const CREDIT_HEADER = /(credit|deposit|deposits|money in|paid in|inflow)/i;

const MONTH_NAMES = {
  jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
  jul: '07', aug: '08', sep: '09', sept: '09', oct: '10', nov: '11', dec: '12',
};

function pad(value) {
  return String(value).padStart(2, '0');
}

function iso(year, month, day) {
  const y = Number(year);
  const m = Number(month);
  const d = Number(day);
  if (!y || !m || !d || m > 12 || d > 31) return null;
  return `${y}-${pad(m)}-${pad(d)}`;
}

export function parseDate(value) {
  const text = String(value || '').trim();
  if (!text) return null;

  let match = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (match) return iso(match[1], match[2], match[3]);

  match = text.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})/);
  if (match) {
    const year = match[3].length === 2 ? `20${match[3]}` : match[3];
    return iso(year, match[2], match[1]);
  }

  match = text.match(/^(\d{1,2})\s+([A-Za-z]{3,9})\.?\s+(\d{4})/);
  if (match) {
    const month = MONTH_NAMES[match[2].slice(0, 4).toLowerCase()] || MONTH_NAMES[match[2].slice(0, 3).toLowerCase()];
    if (month) return iso(match[3], month, match[1]);
  }

  match = text.match(/^([A-Za-z]{3,9})\.?\s+(\d{1,2}),?\s+(\d{4})/);
  if (match) {
    const month = MONTH_NAMES[match[1].slice(0, 3).toLowerCase()];
    if (month) return iso(match[3], month, match[2]);
  }

  return null;
}

export function parseAmount(value) {
  let text = String(value === undefined || value === null ? '' : value).trim();
  if (!text) return NaN;

  let sign = 1;
  if (/^\(.*\)$/.test(text)) {
    sign = -1;
    text = text.slice(1, -1);
  }
  if (/(cr)$/i.test(text)) {
    sign = 1;
    text = text.replace(/(cr)$/i, '');
  } else if (/(dr)$/i.test(text)) {
    sign = -1;
    text = text.replace(/(dr)$/i, '');
  }
  if (/^-/.test(text)) sign = -1;

  const cleaned = text.replace(/[^0-9.]/g, '');
  if (!cleaned) return NaN;
  const number = Number.parseFloat(cleaned);
  if (!Number.isFinite(number)) return NaN;
  return sign * Math.abs(number);
}

export function parseRows(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  const source = String(text || '').replace(/^\uFEFF/, '');

  for (let i = 0; i < source.length; i += 1) {
    const char = source[i];
    if (inQuotes) {
      if (char === '"') {
        if (source[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else if (char !== '\r') {
      field += char;
    }
  }

  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((cells) => cells.some((cell) => String(cell).trim() !== ''));
}

function headerScore(cells) {
  let score = 0;
  for (const cell of cells) {
    const text = String(cell).trim();
    if (DATE_HEADER.test(text) || DESC_HEADER.test(text) || AMOUNT_HEADER.test(text) || DEBIT_HEADER.test(text) || CREDIT_HEADER.test(text)) {
      score += 1;
    }
  }
  return score;
}

function mapColumns(header) {
  const map = { date: -1, description: -1, amount: -1, debit: -1, credit: -1 };
  header.forEach((cell, index) => {
    const text = String(cell).trim();
    if (map.date === -1 && DATE_HEADER.test(text)) map.date = index;
    else if (map.amount === -1 && AMOUNT_HEADER.test(text)) map.amount = index;
    else if (map.debit === -1 && DEBIT_HEADER.test(text)) map.debit = index;
    else if (map.credit === -1 && CREDIT_HEADER.test(text)) map.credit = index;
    else if (map.description === -1 && DESC_HEADER.test(text)) map.description = index;
  });
  return map;
}

function guessColumns(rows) {
  const sample = rows.slice(0, 12);
  const width = Math.max(...sample.map((row) => row.length));
  const map = { date: -1, description: -1, amount: -1, debit: -1, credit: -1 };

  for (let column = 0; column < width; column += 1) {
    const values = sample.map((row) => String(row[column] || '').trim()).filter(Boolean);
    if (!values.length) continue;
    if (map.date === -1 && values.filter((value) => parseDate(value)).length >= values.length * 0.6) {
      map.date = column;
      continue;
    }
    if (map.amount === -1 && values.filter((value) => Number.isFinite(parseAmount(value))).length >= values.length * 0.6) {
      map.amount = column;
      continue;
    }
    if (map.description === -1 && values.filter((value) => /[A-Za-z]{3,}/.test(value) && !parseDate(value)).length >= values.length * 0.6) {
      map.description = column;
    }
  }

  return map;
}

export function parseCsv(text) {
  const rows = parseRows(text);
  if (!rows.length) return [];

  let headerIndex = -1;
  for (let i = 0; i < Math.min(rows.length, 8); i += 1) {
    if (headerScore(rows[i]) >= 2) {
      headerIndex = i;
      break;
    }
  }

  const columns = headerIndex >= 0 ? mapColumns(rows[headerIndex]) : guessColumns(rows);
  const dataRows = headerIndex >= 0 ? rows.slice(headerIndex + 1) : rows;

  if (columns.date === -1) return [];
  if (columns.amount === -1 && columns.debit === -1 && columns.credit === -1) return [];

  const transactions = [];

  dataRows.forEach((row) => {
    const date = parseDate(row[columns.date]);
    if (!date) return;

    let amount = NaN;
    if (columns.amount >= 0) {
      amount = parseAmount(row[columns.amount]);
    }
    if (!Number.isFinite(amount)) {
      const debit = columns.debit >= 0 ? parseAmount(row[columns.debit]) : NaN;
      const credit = columns.credit >= 0 ? parseAmount(row[columns.credit]) : NaN;
      if (Number.isFinite(debit) && Math.abs(debit) > 0) amount = -Math.abs(debit);
      else if (Number.isFinite(credit) && Math.abs(credit) > 0) amount = Math.abs(credit);
    }
    if (!Number.isFinite(amount) || amount === 0) return;

    let description = columns.description >= 0 ? String(row[columns.description] || '').trim() : '';
    if (!description) {
      description = row
        .filter((cell, index) => index !== columns.date && index !== columns.amount && index !== columns.debit && index !== columns.credit)
        .map((cell) => String(cell).trim())
        .filter((cell) => cell && /[A-Za-z]{2,}/.test(cell) && !parseDate(cell))
        .join(' ')
        .trim();
    }
    if (!description) return;

    transactions.push({ date, description, amount: Math.round(amount * 100) / 100 });
  });

  return transactions;
}