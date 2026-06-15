export default function ProgressBar({ pct, status }) {
  const filled = Math.min(Math.round(pct * 10), 10);
  const colorMap = {
    green: 'bg-success-green',
    yellow: 'bg-warning-yellow',
    red: 'bg-warning-red',
  };
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 10 }, (_, i) => (
        <div
          key={i}
          className={`h-3 flex-1 rounded-sm ${i < filled ? colorMap[status] : 'bg-gray-200'}`}
        />
      ))}
    </div>
  );
}
