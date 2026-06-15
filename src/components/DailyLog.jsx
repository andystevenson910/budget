import { useState, useRef, useEffect } from 'react';
import { useSpending } from '../context/SpendingContext';
import MonthSelector from './shared/MonthSelector';

const fmt = n => '$' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
const today = () => new Date().toISOString().split('T')[0];

export default function DailyLog() {
  const { transactions, categories, addTransaction, deleteTransaction } = useSpending();

  const now = new Date();
  const [filterMonth, setFilterMonth] = useState(now.getMonth());
  const [filterYear, setFilterYear] = useState(now.getFullYear());
  const [filterCategory, setFilterCategory] = useState('');
  const [filterType, setFilterType] = useState('All');

  const [form, setForm] = useState({
    date: today(), description: '', category: '', amount: '', type: 'Expense', notes: '',
  });
  const [catSearch, setCatSearch] = useState('');
  const [catOpen, setCatOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const catRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (catRef.current && !catRef.current.contains(e.target)) setCatOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filteredCats = categories.filter(c =>
    c.name.toLowerCase().includes(catSearch.toLowerCase())
  );

  function validate() {
    const e = {};
    if (!form.date) e.date = 'Required';
    if (!form.description.trim()) e.description = 'Required';
    if (!form.category) e.category = 'Required';
    if (!form.amount || isNaN(+form.amount) || +form.amount <= 0) e.amount = 'Must be > 0';
    return e;
  }

  function submit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    addTransaction({ ...form, amount: parseFloat(form.amount) });
    setForm({ date: today(), description: '', category: '', amount: '', type: 'Expense', notes: '' });
    setCatSearch('');
    setErrors({});
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  }

  const displayed = transactions
    .filter(t => {
      const d = new Date(t.date + 'T00:00:00');
      if (d.getMonth() !== filterMonth || d.getFullYear() !== filterYear) return false;
      if (filterCategory && t.category !== filterCategory) return false;
      if (filterType !== 'All' && t.type !== filterType) return false;
      return true;
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="max-w-screen-xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold text-navy">Daily Log</h1>

      {/* Add Form */}
      <div className="bg-white rounded-lg shadow p-5">
        <h2 className="font-semibold text-subheader mb-4">Add Transaction</h2>
        <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

          {/* Date */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
            <input type="date" value={form.date}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-subheader"
            />
            {errors.date && <p className="text-xs text-warning-red mt-1">{errors.date}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Description *</label>
            <input type="text" value={form.description} placeholder="What did you buy?"
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-subheader"
            />
            {errors.description && <p className="text-xs text-warning-red mt-1">{errors.description}</p>}
          </div>

          {/* Category */}
          <div ref={catRef} className="relative">
            <label className="block text-xs font-medium text-gray-600 mb-1">Category *</label>
            <input
              type="text"
              value={catSearch || form.category}
              placeholder="Search category…"
              onFocus={() => { setCatSearch(''); setCatOpen(true); }}
              onChange={e => { setCatSearch(e.target.value); setForm(f => ({ ...f, category: '' })); setCatOpen(true); }}
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-subheader"
            />
            {errors.category && <p className="text-xs text-warning-red mt-1">{errors.category}</p>}
            {catOpen && (
              <div className="absolute z-20 w-full bg-white border rounded shadow-lg max-h-48 overflow-y-auto mt-1">
                {filteredCats.length === 0
                  ? <div className="px-3 py-2 text-sm text-gray-400">No categories found</div>
                  : filteredCats.map(c => (
                    <button key={c.id} type="button"
                      className="w-full text-left px-3 py-2 text-sm hover:bg-alt-row"
                      onClick={() => { setForm(f => ({ ...f, category: c.name })); setCatSearch(''); setCatOpen(false); }}
                    >{c.name}</button>
                  ))
                }
              </div>
            )}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Amount *</label>
            <input type="number" min="0.01" step="0.01" value={form.amount} placeholder="0.00"
              onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-subheader"
            />
            {errors.amount && <p className="text-xs text-warning-red mt-1">{errors.amount}</p>}
          </div>

          {/* Type */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
            <select value={form.type}
              onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-subheader bg-white"
            >
              <option>Expense</option>
              <option>Income</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
            <input type="text" value={form.notes} placeholder="Optional"
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-subheader"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-3 flex items-center gap-4">
            <button type="submit"
              className="bg-subheader text-white px-6 py-2 rounded font-medium hover:bg-blue-800 transition-colors"
            >
              Add Transaction
            </button>
            {success && <span className="text-success-green text-sm font-medium">✓ Saved!</span>}
          </div>
        </form>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 flex flex-wrap gap-4 items-center">
        <MonthSelector month={filterMonth} year={filterYear}
          onChange={(m, y) => { setFilterMonth(m); setFilterYear(y); }} />
        <select value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
          className="border rounded px-3 py-1.5 text-sm bg-white"
        >
          <option value="">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
        </select>
        {['All', 'Expenses', 'Income'].map(t => (
          <button key={t}
            onClick={() => setFilterType(t === 'Expenses' ? 'Expense' : t === 'Income' ? 'Income' : 'All')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              (filterType === 'All' && t === 'All') ||
              (filterType === 'Expense' && t === 'Expenses') ||
              (filterType === 'Income' && t === 'Income')
                ? 'bg-subheader text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >{t}</button>
        ))}
      </div>

      {/* Table */}
      {displayed.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-gray-500 font-medium">No transactions for this period</p>
          <p className="text-gray-400 text-sm mt-1">Add your first transaction above</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-navy text-white text-xs uppercase">
                  <th className="text-left px-4 py-2">Date</th>
                  <th className="text-left px-4 py-2">Description</th>
                  <th className="text-left px-4 py-2">Category</th>
                  <th className="text-right px-4 py-2">Amount</th>
                  <th className="text-left px-4 py-2">Type</th>
                  <th className="text-left px-4 py-2">Notes</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody>
                {displayed.map((t, i) => (
                  <tr key={t.id} className={i % 2 === 0 ? 'bg-white' : 'bg-alt-row'}>
                    <td className="px-4 py-2 text-gray-600 whitespace-nowrap">{t.date}</td>
                    <td className="px-4 py-2 font-medium">{t.description}</td>
                    <td className="px-4 py-2 text-gray-600">{t.category}</td>
                    <td className={`px-4 py-2 text-right font-semibold ${
                      t.type === 'Income' ? 'text-success-green' : 'text-warning-red'
                    }`}>
                      {t.type === 'Income' ? '+' : '-'}{fmt(t.amount)}
                    </td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        t.type === 'Income'
                          ? 'bg-green-bg text-success-green'
                          : 'bg-red-bg text-warning-red'
                      }`}>{t.type}</span>
                    </td>
                    <td className="px-4 py-2 text-gray-400 text-xs">{t.notes}</td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete "${t.description}"?`)) deleteTransaction(t.id);
                        }}
                        className="text-gray-400 hover:text-warning-red transition-colors"
                        title="Delete"
                      >🗑</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
