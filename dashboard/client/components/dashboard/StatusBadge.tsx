

export default function StatusBadge({ status, color }: { status: string; color: string }) {
  const map: Record<string, string> = {
    approved: "bg-green-100 text-green-700",
    review: "bg-orange-100 text-orange-600",
    rejected: "bg-red-100 text-red-600",
  };
  return <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${map[color]}`}>{status}</span>;
}