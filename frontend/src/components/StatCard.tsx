type Props = {
  title: string;
  value: string | number;
  accent?: "blue" | "green" | "orange" | "red";
};

const accentMap: Record<NonNullable<Props["accent"]>, string> = {
  blue: "bg-blue-50 text-blue-700",
  green: "bg-emerald-50 text-emerald-700",
  orange: "bg-amber-50 text-amber-700",
  red: "bg-rose-50 text-rose-700",
};

export const StatCard = ({ title, value, accent = "blue" }: Props) => {
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </p>
      <div className={`inline-flex items-baseline rounded-lg px-3 py-1 text-lg font-semibold ${accentMap[accent]}`}>
        {value}
      </div>
    </div>
  );
};

