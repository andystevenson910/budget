const CSV_HEADERS = ['date', 'description', 'category', 'amount', 'type', 'notes'];

function escapeField(value) {
  const str = String(value ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

export function exportCSV(transactions) {
  const rows = [CSV_HEADERS.join(',')];
  for (const t of transactions) {
    rows.push([
      escapeField(t.date),
      escapeField(t.description),
      escapeField(t.category),
      escapeField(t.amount),
      escapeField(t.type),
      escapeField(t.notes ?? ''),
    ].join(','));
  }
  return rows.join('\n');
}

export function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return { rows: [], errors: ['File appears empty'] };

  const headers = parseCSVLine(lines[0]).map(h => h.trim().toLowerCase());
  const required = ['date', 'description', 'category', 'amount', 'type'];
  const missing = required.filter(r => !headers.includes(r));
  if (missing.length > 0) {
    return { rows: [], errors: [`Missing required columns: ${missing.join(', ')}`] };
  }

  const rows = [];
  const errors = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = parseCSVLine(line);
    const obj = {};
    headers.forEach((h, idx) => { obj[h] = values[idx] ?? ''; });

    const rowErrors = validateCSVRow(obj, i + 1);
    if (rowErrors.length > 0) {
      errors.push(...rowErrors);
      continue;
    }

    rows.push({
      id: crypto.randomUUID(),
      date: obj.date.trim(),
      description: obj.description.trim(),
      category: obj.category.trim(),
      amount: parseFloat(obj.amount),
      type: obj.type.trim(),
      notes: (obj.notes ?? '').trim(),
    });
  }

  return { rows, errors };
}

function parseCSVLine(line) {
  const fields = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        fields.push(current);
        current = '';
      } else {
        current += ch;
      }
    }
  }
  fields.push(current);
  return fields;
}

function validateCSVRow(obj, lineNum) {
  const errors = [];
  const prefix = `Row ${lineNum}:`;

  if (!obj.date?.trim()) {
    errors.push(`${prefix} date is required`);
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(obj.date.trim())) {
    errors.push(`${prefix} date must be YYYY-MM-DD format (got: "${obj.date.trim()}")`);
  }

  if (!obj.description?.trim()) {
    errors.push(`${prefix} description is required`);
  }

  if (!obj.category?.trim()) {
    errors.push(`${prefix} category is required`);
  }

  const amount = parseFloat(obj.amount);
  if (!obj.amount?.trim()) {
    errors.push(`${prefix} amount is required`);
  } else if (isNaN(amount) || amount <= 0) {
    errors.push(`${prefix} amount must be a positive number (got: "${obj.amount}")`);
  }

  const type = obj.type?.trim();
  if (!type) {
    errors.push(`${prefix} type is required`);
  } else if (type !== 'Expense' && type !== 'Income') {
    errors.push(`${prefix} type must be "Expense" or "Income" (got: "${type}")`);
  }

  return errors;
}

export function validateCSVCategories(rows, categories) {
  const validNames = new Set(categories.map(c => c.name));
  const warnings = [];
  const unknownCats = new Set();

  for (const row of rows) {
    if (!validNames.has(row.category) && !unknownCats.has(row.category)) {
      unknownCats.add(row.category);
      warnings.push(`Unknown category: "${row.category}" — will be imported but won't match a budget`);
    }
  }
  return warnings;
}
