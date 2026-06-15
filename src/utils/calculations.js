export function spentThisMonth(transactions, categoryName, month, year) {
  return transactions
    .filter(t => {
      const d = new Date(t.date + 'T00:00:00');
      return t.type === 'Expense'
        && t.category === categoryName
        && d.getMonth() === month
        && d.getFullYear() === year;
    })
    .reduce((sum, t) => sum + t.amount, 0);
}

export function incomeThisMonth(transactions, month, year) {
  return transactions
    .filter(t => {
      const d = new Date(t.date + 'T00:00:00');
      return t.type === 'Income' && d.getMonth() === month && d.getFullYear() === year;
    })
    .reduce((sum, t) => sum + t.amount, 0);
}

export function totalExpensesThisMonth(transactions, month, year) {
  return transactions
    .filter(t => {
      const d = new Date(t.date + 'T00:00:00');
      return t.type === 'Expense' && d.getMonth() === month && d.getFullYear() === year;
    })
    .reduce((sum, t) => sum + t.amount, 0);
}

export function expensesOnDay(transactions, dateStr) {
  return transactions
    .filter(t => t.type === 'Expense' && t.date === dateStr)
    .reduce((sum, t) => sum + t.amount, 0);
}

export function incomeOnDay(transactions, dateStr) {
  return transactions
    .filter(t => t.type === 'Income' && t.date === dateStr)
    .reduce((sum, t) => sum + t.amount, 0);
}

export function netOnDay(transactions, dateStr) {
  return incomeOnDay(transactions, dateStr) - expensesOnDay(transactions, dateStr);
}

export function buildDailySummary(transactions) {
  const daySet = new Set(transactions.map(t => t.date));
  const sortedDays = Array.from(daySet).sort();
  let running = 0;
  return sortedDays.map(d => {
    const exp = expensesOnDay(transactions, d);
    const inc = incomeOnDay(transactions, d);
    const net = inc - exp;
    running += net;
    return { date: d, expenses: exp, income: inc, net, cumulativeNet: running };
  });
}

export function remaining(cat, transactions, month, year) {
  return cat.monthlyBudget - spentThisMonth(transactions, cat.name, month, year);
}

export function pctUsed(cat, transactions, month, year) {
  if (cat.monthlyBudget <= 0) return 0;
  return spentThisMonth(transactions, cat.name, month, year) / cat.monthlyBudget;
}

export function budgetStatus(pct) {
  if (pct >= 0.9) return 'red';
  if (pct >= 0.7) return 'yellow';
  return 'green';
}
