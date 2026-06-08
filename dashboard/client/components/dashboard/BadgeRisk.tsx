export default function BadgeRisk({
  type,
}: {
  type: string;
}) {
  const map: Record<string, string> = {
    LOW: "bg-green-100 text-green-700 border border-green-200",
    MEDIUM: "bg-orange-100 text-orange-600 border border-orange-200",
    HIGH: "bg-red-100 text-red-600 border border-red-200",
  };

  return (
    <span
      className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
        map[type] || ""
      }`}
    >
      {type}
    </span>
  );
}