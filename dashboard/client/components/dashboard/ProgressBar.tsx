

export default function ProgressBar({ pct }: { pct: number }) {
  if (pct === 0) return <div className="flex-1 h-1.5 bg-gray-100 rounded-full" />;
  return (
    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
      <div className="h-full rounded-full bg-red-500" style={{ width: `${pct}%` }} />
    </div>
  );
}
