import { useState, useRef } from 'react';
import { useSpending } from '../context/SpendingContext';
import { exportCSV, parseCSV, validateCSVCategories } from '../utils/csv';
import { exportJSON, parseJSONImport } from '../utils/json';

export default function BudgetSetup() {
  const { transactions, categories, settings, addCategory, updateCategory, deleteCategory, importData, clearData } = useSpending();

  const [editId, setEditId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [newCat, setNewCat] = useState({ name: '', monthlyBudget: '' });
  const [newCatError, setNewCatError] = useState('');

  const [importModal, setImportModal] = useState(null); // { rows, warnings, mode, type }
  const [importError, setImportError] = useState('');
  const [clearStep, setClearStep] = useState(0);

  const jsonImportRef = useRef();
  const csvImportRef = useRef();

  function startEdit(cat) {
    setEditId(cat.id);
    setEditValues({ name: cat.name, monthlyBudget: String(cat.monthlyBudget) });
  }

  function saveEdit(id) {
    const budget = parseFloat(editValues.monthlyBudget);
    if (!editValues.name.trim() || isNaN(budget) || budget < 0) return;
    updateCategory(id, { name: editValues.name.trim(), monthlyBudget: budget });
    setEditId(null);
  }

  function canDelete(catId) {
    const cat = categories.find(c => c.id === catId);
    return !cat || !transactions.some(t => t.category === cat.name);
  }

  function addNewCategory() {
    if (!newCat.name.trim()) { setNewCatError('Name is required'); return; }
    const budget = parseFloat(newCat.monthlyBudget);
    if (isNaN(budget) || budget < 0) { setNewCatError('Budget must be a positive number'); return; }
    addCategory({ name: newCat.name.trim(), monthlyBudget: budget });
    setNewCat({ name: '', monthlyBudget: '' });
    setNewCatError('');
  }

  // ── Exports ──────────────────────────────────────────────────────────────

  function downloadFile(content, filename, mime) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleExportJSON() {
    const data = { transactions, categories, settings };
    downloadFile(exportJSON(data), 'spending-tracker.json', 'application/json');
  }

  function handleExportCSV() {
    downloadFile(exportCSV(transactions), 'spending-tracker.csv', 'text/csv');
  }

  // ── Imports ──────────────────────────────────────────────────────────────

  function handleJSONFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const { data, error } = parseJSONImport(ev.target.result);
      if (error) { setImportError(error); return; }
      setImportError('');
      setImportModal({ type: 'json', data, warnings: [], rows: data.transactions });
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  function handleCSVFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const { rows, errors } = parseCSV(ev.target.result);
      if (errors.length > 0) {
        setImportError('CSV errors:\n' + errors.join('\n'));
        return;
      }
      const warnings = validateCSVCategories(rows, categories);
      setImportError('');
      setImportModal({ type: 'csv', rows, warnings, data: null });
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  function confirmImport(mode) {
    if (importModal.type === 'json') {
      importData(importModal.data, mode);
    } else {
      // CSV: merge/replace transactions only
      if (mode === 'replace') {
        importData({ transactions: importModal.rows, categories, settings }, 'replace');
      } else {
        importData({ transactions: importModal.rows, categories, settings }, 'merge');
      }
    }
    setImportModal(null);
  }

  function handleClear() {
    if (clearStep === 0) { setClearStep(1); return; }
    if (clearStep === 1) { setClearStep(2); return; }
    clearData();
    setClearStep(0);
  }

  return (
    <div className="max-w-screen-xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold text-navy">Budget Setup</h1>

      {/* Category Management */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="bg-subheader text-white px-4 py-3">
          <h2 className="font-semibold">Categories & Budgets</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-navy text-white text-xs uppercase">
                <th className="text-left px-4 py-2">Category</th>
                <th className="text-right px-4 py-2">Monthly Budget</th>
                <th className="px-4 py-2 w-24" />
              </tr>
            </thead>
            <tbody>
              {categories.map((cat, i) => (
                <tr key={cat.id} className={i % 2 === 0 ? 'bg-white' : 'bg-alt-row'}>
                  <td className="px-4 py-2">
                    {editId === cat.id ? (
                      <input value={editValues.name}
                        onChange={e => setEditValues(v => ({ ...v, name: e.target.value }))}
                        className="border rounded px-2 py-1 text-sm w-full focus:outline-none focus:ring-1 focus:ring-subheader"
                      />
                    ) : cat.name}
                  </td>
                  <td className="px-4 py-2 text-right">
                    {editId === cat.id ? (
                      <input type="number" min="0" step="1" value={editValues.monthlyBudget}
                        onChange={e => setEditValues(v => ({ ...v, monthlyBudget: e.target.value }))}
                        className="border rounded px-2 py-1 text-sm w-28 text-right focus:outline-none focus:ring-1 focus:ring-subheader"
                      />
                    ) : '$' + cat.monthlyBudget.toFixed(0)}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex justify-end gap-2">
                      {editId === cat.id ? (
                        <>
                          <button onClick={() => saveEdit(cat.id)}
                            className="text-xs bg-success-green text-white px-2 py-1 rounded hover:opacity-80">Save</button>
                          <button onClick={() => setEditId(null)}
                            className="text-xs bg-gray-300 px-2 py-1 rounded hover:bg-gray-400">Cancel</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEdit(cat)}
                            className="text-xs text-subheader hover:underline">Edit</button>
                          <button
                            onClick={() => {
                              if (canDelete(cat.id) && window.confirm(`Delete "${cat.name}"?`)) {
                                deleteCategory(cat.id);
                              }
                            }}
                            disabled={!canDelete(cat.id)}
                            title={canDelete(cat.id) ? 'Delete' : 'Cannot delete: category has transactions'}
                            className={`text-xs ${canDelete(cat.id) ? 'text-warning-red hover:underline' : 'text-gray-300 cursor-not-allowed'}`}
                          >Delete</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add Category */}
        <div className="p-4 border-t">
          <h3 className="text-sm font-semibold text-gray-600 mb-3">Add Category</h3>
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Name</label>
              <input type="text" value={newCat.name} placeholder="e.g. 🎮 Gaming"
                onChange={e => setNewCat(v => ({ ...v, name: e.target.value }))}
                className="border rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-subheader"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Monthly Budget ($)</label>
              <input type="number" min="0" step="1" value={newCat.monthlyBudget} placeholder="0"
                onChange={e => setNewCat(v => ({ ...v, monthlyBudget: e.target.value }))}
                className="border rounded px-3 py-1.5 text-sm w-28 focus:outline-none focus:ring-1 focus:ring-subheader"
              />
            </div>
            <button onClick={addNewCategory}
              className="bg-subheader text-white px-4 py-1.5 rounded text-sm hover:bg-blue-800">
              Add Category
            </button>
          </div>
          {newCatError && <p className="text-xs text-warning-red mt-2">{newCatError}</p>}
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white rounded-lg shadow p-5 space-y-4">
        <h2 className="font-semibold text-subheader">Data Management</h2>

        {importError && (
          <div className="bg-red-bg border border-warning-red text-warning-red text-sm p-3 rounded whitespace-pre-wrap">
            {importError}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Export JSON */}
          <div className="border rounded p-4">
            <h3 className="font-medium text-sm mb-1">Export Data (JSON)</h3>
            <p className="text-xs text-gray-500 mb-3">Full backup: transactions, categories, and settings.</p>
            <button onClick={handleExportJSON}
              className="bg-navy text-white px-4 py-2 rounded text-sm hover:bg-section">
              ⬇ Export JSON
            </button>
          </div>

          {/* Export CSV */}
          <div className="border rounded p-4">
            <h3 className="font-medium text-sm mb-1">Export Transactions (CSV)</h3>
            <p className="text-xs text-gray-500 mb-3">
              All transactions as a spreadsheet-compatible CSV.{' '}
              <a href="/CSV_IMPORT_FORMAT.md" target="_blank" className="text-subheader underline text-xs">
                View format docs
              </a>
            </p>
            <button onClick={handleExportCSV}
              className="bg-subheader text-white px-4 py-2 rounded text-sm hover:bg-blue-800">
              ⬇ Export CSV
            </button>
          </div>

          {/* Import JSON */}
          <div className="border rounded p-4">
            <h3 className="font-medium text-sm mb-1">Import Data (JSON)</h3>
            <p className="text-xs text-gray-500 mb-3">Restore from a JSON export file.</p>
            <input ref={jsonImportRef} type="file" accept=".json" className="hidden" onChange={handleJSONFile} />
            <button onClick={() => jsonImportRef.current.click()}
              className="bg-navy text-white px-4 py-2 rounded text-sm hover:bg-section">
              ⬆ Import JSON
            </button>
          </div>

          {/* Import CSV */}
          <div className="border rounded p-4">
            <h3 className="font-medium text-sm mb-1">Import Transactions (CSV)</h3>
            <p className="text-xs text-gray-500 mb-3">
              Import transactions from a CSV file.{' '}
              <a href="/CSV_IMPORT_FORMAT.md" target="_blank" className="text-subheader underline text-xs">
                View format docs
              </a>
            </p>
            <input ref={csvImportRef} type="file" accept=".csv" className="hidden" onChange={handleCSVFile} />
            <button onClick={() => csvImportRef.current.click()}
              className="bg-subheader text-white px-4 py-2 rounded text-sm hover:bg-blue-800">
              ⬆ Import CSV
            </button>
          </div>
        </div>

        {/* Clear Data */}
        <div className="border border-warning-red/30 rounded p-4">
          <h3 className="font-medium text-sm text-warning-red mb-1">Clear All Data</h3>
          <p className="text-xs text-gray-500 mb-3">Permanently deletes all transactions. Categories reset to defaults.</p>
          {clearStep === 0 && (
            <button onClick={handleClear}
              className="bg-gray-100 text-warning-red border border-warning-red/30 px-4 py-2 rounded text-sm hover:bg-red-bg">
              Clear All Data
            </button>
          )}
          {clearStep === 1 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-warning-red">Are you sure? This cannot be undone.</p>
              <div className="flex gap-2">
                <button onClick={handleClear}
                  className="bg-warning-red text-white px-4 py-2 rounded text-sm hover:opacity-80">
                  Yes, I'm sure
                </button>
                <button onClick={() => setClearStep(0)}
                  className="bg-gray-200 px-4 py-2 rounded text-sm hover:bg-gray-300">Cancel</button>
              </div>
            </div>
          )}
          {clearStep === 2 && (
            <div className="space-y-2">
              <p className="text-sm font-bold text-warning-red">Final confirmation — delete ALL data?</p>
              <div className="flex gap-2">
                <button onClick={handleClear}
                  className="bg-warning-red text-white px-4 py-2 rounded text-sm font-bold hover:opacity-80">
                  Delete Everything
                </button>
                <button onClick={() => setClearStep(0)}
                  className="bg-gray-200 px-4 py-2 rounded text-sm hover:bg-gray-300">Cancel</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Import Modal */}
      {importModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="font-semibold text-lg text-navy mb-2">
              Import {importModal.rows.length} transaction{importModal.rows.length !== 1 ? 's' : ''}
            </h3>

            {importModal.warnings.length > 0 && (
              <div className="bg-yellow-50 border border-warning-yellow text-yellow-800 text-xs p-3 rounded mb-4 space-y-1">
                {importModal.warnings.map((w, i) => <p key={i}>⚠ {w}</p>)}
              </div>
            )}

            <p className="text-sm text-gray-600 mb-4">
              How would you like to import?
            </p>
            <div className="space-y-3">
              <button onClick={() => confirmImport('merge')}
                className="w-full text-left border rounded p-3 hover:bg-alt-row text-sm">
                <span className="font-medium">Merge</span>
                <span className="text-gray-500 ml-2">— add to existing transactions (skips duplicates by ID)</span>
              </button>
              <button onClick={() => confirmImport('replace')}
                className="w-full text-left border border-warning-red/30 rounded p-3 hover:bg-red-bg text-sm">
                <span className="font-medium text-warning-red">Replace</span>
                <span className="text-gray-500 ml-2">— delete all existing transactions and replace with import</span>
              </button>
            </div>
            <button onClick={() => setImportModal(null)}
              className="mt-4 text-sm text-gray-400 hover:text-gray-600">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
