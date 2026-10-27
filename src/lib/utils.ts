export const cn = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

export const inr = (n: number) =>
  "₹" + Math.round(n).toLocaleString("en-IN");

export const inrShort = (n: number) =>
  n >= 1e7 ? `₹${(n / 1e7).toFixed(2)} Cr` : n >= 1e5 ? `₹${(n / 1e5).toFixed(2)} L` : inr(n);

/** Demo "today" is fixed so seeded dates always make sense next to each other. */
export const TODAY = new Date("2026-10-27T10:00:00");

export const isoDay = (d: Date) => d.toISOString().slice(0, 10);
export const addDays = (d: Date | string, n: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return isoDay(x);
};
export const fmtDate = (s: string) =>
  new Date(s).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

/** Indian financial year label, e.g. 2026-27 */
export const fy = (d: Date = TODAY) => {
  const y = d.getMonth() >= 3 ? d.getFullYear() : d.getFullYear() - 1;
  return `${y}-${String(y + 1).slice(2)}`;
};

export const initials = (name: string) =>
  name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
