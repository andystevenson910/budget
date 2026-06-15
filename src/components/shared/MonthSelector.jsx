const MONTHS = ['January','February','March','April','May','June',
                 'July','August','September','October','November','December'];

export default function MonthSelector({ month, year, onChange }) {
  function prev() {
    if (month === 0) onChange(11, year - 1);
    else onChange(month - 1, year);
  }
  function next() {
    if (month === 11) onChange(0, year + 1);
    else onChange(month + 1, year);
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={prev}
        className="w-8 h-8 flex items-center justify-center rounded bg-subheader text-white hover:bg-blue-700"
        aria-label="Previous month"
      >‹</button>
      <span className="font-semibold text-navy min-w-[140px] text-center">
        {MONTHS[month]} {year}
      </span>
      <button
        onClick={next}
        className="w-8 h-8 flex items-center justify-center rounded bg-subheader text-white hover:bg-blue-700"
        aria-label="Next month"
      >›</button>
    </div>
  );
}
