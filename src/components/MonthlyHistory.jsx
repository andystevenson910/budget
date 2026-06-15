import { useSpending } from '../context/SpendingContext';
import { spentThisMonth } from '../utils/calculations';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const fmt = n => '$' + n.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
const fmtFull = n => '$' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function cellClass(spent, budget) {
  if (spent === 0) return '';
  const pct = budget > 0 ? spent / budget : 0;
  if (pct >= 1) return 'bg-red-bg text-warning-red font-semibold';
  if (pct >= 0.7) return 'bg-yellow-100 text-warning-yellow font-semibold';
  return 'bg-green-bg text-success-green';
}

export default function MonthlyHistory() {
  const { transactions, categories, settings } = useSpending();
  const year = settings?.startYear ?? new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  const chartData = MONTH_NAMES.map((label, m) => {
    const spent = categories.reduce(
      (sum, cat) => sum + spentThisMonth(transactions, cat.name, m, year), 0
    );
    const budget = categories.reduce((sum, cat) => sum + cat.monthlyBudget, 0);
    return { month: label, Spent: +spent.toFixed(2), Budget: +budget.toFixed(2) };
  });

  return (
    <div className="max-w-screen-xl mx-auto p-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Monthly History</h1>
        <p className="text-gray-500">{year}</p>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="font-semibold text-subheader mb-4">Spending vs Budget — {year}</h2>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={v => '$' + v.toLocaleString()} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v) => fmtFull(v)} />
            <Legend />
            <Bar dataKey="Budget" fill="#1A1A2E" radius={[2,2,0,0]} />
            <Bar dataKey="Spent" fill="#E94560" radius={[2,2,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-navy text-white">
                <th className="text-left px-3 py-2 sticky left-0 bg-navy">Category</th>
                {MONTH_NAMES.map((m, idx) => (
                  <th key={m}
                    colSpan={2}
                    className={`text-center px-1 py-2 border-l border-white/20 ${
                      idx === currentMonth ? 'bg-subheader' : ''
                    }`}
                  >{m}</th>
                ))}
                <th className="text-right px-3 py-2 border-l border-white/20">YTD Spent</th>
              </tr>
              <tr className="bg-section text-gray-300 text-xs">
                <th className="px-3 py-1 sticky left-0 bg-section" />
                {MONTH_NAMES.map((m, idx) => (
                  <th key={`${m}-s`} className={`text-right px-2 py-1 ${idx === currentMonth ? 'bg-subheader/70' : ''}`}>Spent</th>
                ))}
                {/* extra budget col removed for width — just Spent columns */}
                <th />
              </tr>
            </thead>
            <tbody>
              {categories.map((cat, ci) => {
                const ytd = MONTH_NAMES.reduce(
                  (sum, _, m) => sum + spentThisMonth(transactions, cat.name, m, year), 0
                );
                return (
                  <tr key={cat.id} className={ci % 2 === 0 ? 'bg-white' : 'bg-alt-row'}>
                    <td className={`px-3 py-1.5 font-medium sticky left-0 ${ci % 2 === 0 ? 'bg-white' : 'bg-alt-row'}`}>
                      {cat.name}
                    </td>
                    {MONTH_NAMES.map((_, m) => {
                      const s = spentThisMonth(transactions, cat.name, m, year);
                      return (
                        <td key={m}
                          colSpan={2}
                          className={`text-right px-2 py-1.5 ${cellClass(s, cat.monthlyBudget)} ${
                            m === currentMonth ? 'border-l-2 border-r-2 border-subheader/40' : ''
                          }`}
                        >
                          {s > 0 ? fmtFull(s) : <span className="text-gray-300">—</span>}
                        </td>
                      );
                    })}
                    <td className="text-right px-3 py-1.5 font-semibold">
                      {ytd > 0 ? fmtFull(ytd) : <span className="text-gray-300">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-section text-white font-semibold">
                <td className="px-3 py-2 sticky left-0 bg-section">Totals</td>
                {MONTH_NAMES.map((_, m) => {
                  const s = categories.reduce(
                    (sum, cat) => sum + spentThisMonth(transactions, cat.name, m, year), 0
                  );
                  return (
                    <td key={m} colSpan={2} className="text-right px-2 py-2">
                      {s > 0 ? fmtFull(s) : '—'}
                    </td>
                  );
                })}
                <td className="text-right px-3 py-2">
                  {fmtFull(categories.reduce(
                    (sum, cat) => sum + MONTH_NAMES.reduce(
                      (s2, _, m) => s2 + spentThisMonth(transactions, cat.name, m, year), 0
                    ), 0
                  ))}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
