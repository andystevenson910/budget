import { useSpending } from '../context/SpendingContext';
import {
  spentThisMonth, incomeThisMonth, totalExpensesThisMonth,
  remaining, pctUsed, budgetStatus,
} from '../utils/calculations';
import ProgressBar from './shared/ProgressBar';

const fmt = n => '$' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

const statusStyles = {
  green:  { cell: 'bg-green-bg text-success-green',   text: 'text-success-green'  },
  yellow: { cell: 'bg-yellow-100 text-warning-yellow', text: 'text-warning-yellow' },
  red:    { cell: 'bg-red-bg text-warning-red',        text: 'text-warning-red'    },
};

export default function Dashboard() {
  const { transactions, categories } = useSpending();
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();

  const spent = totalExpensesThisMonth(transactions, month, year);
  const income = incomeThisMonth(transactions, month, year);

  const MONTHS = ['January','February','March','April','May','June',
                  'July','August','September','October','November','December'];
  const subtitle = `${MONTHS[month]} ${year}`;

  const totalBudget = categories.reduce((s, c) => s + c.monthlyBudget, 0);
  const totalSpent  = categories.reduce((s, c) => s + spentThisMonth(transactions, c.name, month, year), 0);
  const totalRemain = totalBudget - totalSpent;

  return (
    <div className="max-w-screen-xl mx-auto p-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Dashboard</h1>
        <p className="text-gray-500">{subtitle}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow p-5 border-l-4 border-accent">
          <p className="text-sm text-gray-500 uppercase tracking-wide">Spent This Month</p>
          <p className="text-3xl font-bold text-accent mt-1">{fmt(spent)}</p>
          <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-5 border-l-4 border-success-green">
          <p className="text-sm text-gray-500 uppercase tracking-wide">Income This Month</p>
          <p className="text-3xl font-bold text-success-green mt-1">{fmt(income)}</p>
          <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
        </div>
      </div>

      {/* Budget vs Actual Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="bg-subheader text-white px-4 py-3">
          <h2 className="font-semibold">Budget vs Actual</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-navy text-white text-xs uppercase">
                <th className="text-left px-4 py-2">Category</th>
                <th className="text-right px-4 py-2">Budget</th>
                <th className="text-right px-4 py-2">Spent</th>
                <th className="text-right px-4 py-2">Remaining</th>
                <th className="text-right px-4 py-2">% Used</th>
                <th className="px-4 py-2 min-w-[120px]">Progress</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat, i) => {
                const s = spentThisMonth(transactions, cat.name, month, year);
                const r = remaining(cat, transactions, month, year);
                const p = pctUsed(cat, transactions, month, year);
                const status = budgetStatus(p);
                const styles = statusStyles[status];
                return (
                  <tr key={cat.id} className={i % 2 === 0 ? 'bg-white' : 'bg-alt-row'}>
                    <td className="px-4 py-2 font-medium">{cat.name}</td>
                    <td className="px-4 py-2 text-right text-gray-600">{fmt(cat.monthlyBudget)}</td>
                    <td className="px-4 py-2 text-right font-medium">{fmt(s)}</td>
                    <td className={`px-4 py-2 text-right font-semibold rounded-sm ${styles.cell}`}>{fmt(r)}</td>
                    <td className={`px-4 py-2 text-right font-semibold ${styles.text}`}>
                      {Math.round(p * 100)}%
                    </td>
                    <td className="px-4 py-2">
                      <ProgressBar pct={p} status={status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-section text-white font-semibold">
                <td className="px-4 py-2">Totals</td>
                <td className="px-4 py-2 text-right">{fmt(totalBudget)}</td>
                <td className="px-4 py-2 text-right">{fmt(totalSpent)}</td>
                <td className="px-4 py-2 text-right">{fmt(totalRemain)}</td>
                <td className="px-4 py-2 text-right">
                  {totalBudget > 0 ? Math.round(totalSpent / totalBudget * 100) : 0}%
                </td>
                <td className="px-4 py-2" />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
