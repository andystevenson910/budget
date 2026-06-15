import { useState } from 'react';
import { useSpending } from '../context/SpendingContext';
import { buildDailySummary } from '../utils/calculations';
import MonthSelector from './shared/MonthSelector';

const fmt = n => '$' + Math.abs(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
const fmtSigned = n => (n >= 0 ? '+' : '-') + fmt(n);
const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];

function fmtDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return `${MONTHS[d.getMonth()].slice(0, 3)} ${d.getDate()}, ${d.getFullYear()}`;
}

export default function DailySummary() {
  const { transactions } = useSpending();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());
  const [sortAsc, setSortAsc] = useState(false);

  const monthTx = transactions.filter(t => {
    const d = new Date(t.date + 'T00:00:00');
    return d.getMonth() === month && d.getFullYear() === year;
  });

  const summary = buildDailySummary(monthTx);
  const rows = sortAsc ? summary : [...summary].reverse();

  return (
    <div className="max-w-screen-xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold text-navy">Daily Summary</h1>

      <div className="flex flex-wrap items-center gap-4">
        <MonthSelector month={month} year={year}
          onChange={(m, y) => { setMonth(m); setYear(y); }} />
        <button
          onClick={() => setSortAsc(s => !s)}
          className="px-3 py-1.5 text-sm bg-gray-100 rounded hover:bg-gray-200 text-gray-600"
        >
          {sortAsc ? '↑ Oldest first' : '↓ Newest first'}
        </button>
      </div>

      {rows.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-4xl mb-3">📅</p>
          <p className="text-gray-500 font-medium">No transactions in {MONTHS[month]} {year}</p>
          <p className="text-gray-400 text-sm mt-1">Log transactions in the Daily Log tab</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-navy text-white text-xs uppercase">
                  <th className="text-left px-4 py-2">Date</th>
                  <th className="text-right px-4 py-2">Total Expenses</th>
                  <th className="text-right px-4 py-2">Total Income</th>
                  <th className="text-right px-4 py-2">Net</th>
                  <th className="text-right px-4 py-2">Cumulative Net</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={row.date} className={i % 2 === 0 ? 'bg-white' : 'bg-alt-row'}>
                    <td className="px-4 py-2 font-medium">{fmtDate(row.date)}</td>
                    <td className="px-4 py-2 text-right text-warning-red font-medium">
                      -{fmt(row.expenses)}
                    </td>
                    <td className="px-4 py-2 text-right text-success-green font-medium">
                      {row.income > 0 ? `+${fmt(row.income)}` : fmt(0)}
                    </td>
                    <td className={`px-4 py-2 text-right font-semibold ${
                      row.net < 0 ? 'text-warning-red' : 'text-success-green'
                    }`}>
                      {fmtSigned(row.net)}
                    </td>
                    <td className={`px-4 py-2 text-right font-bold ${
                      row.cumulativeNet < 0 ? 'text-warning-red' : 'text-success-green'
                    }`}>
                      {fmtSigned(row.cumulativeNet)}
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
