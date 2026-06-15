export function exportJSON(data) {
  return JSON.stringify(data, null, 2);
}

export function parseJSONImport(text) {
  try {
    const parsed = JSON.parse(text);
    if (!parsed.transactions || !Array.isArray(parsed.transactions)) {
      return { data: null, error: 'Invalid format: missing transactions array' };
    }
    if (!parsed.categories || !Array.isArray(parsed.categories)) {
      return { data: null, error: 'Invalid format: missing categories array' };
    }
    return { data: parsed, error: null };
  } catch (e) {
    return { data: null, error: 'Invalid JSON: ' + e.message };
  }
}
