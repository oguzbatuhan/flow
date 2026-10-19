const pad = (n) => String(n).padStart(2, "0");

export const toIso = (d) => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());

export const fromIso = (s) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d, 12);
};

const weekdayLong = (d) => d.toLocaleDateString("tr-TR", { weekday: "long" });
const dayAndMonthLong = (d) => d.getDate() + " " + d.toLocaleDateString("tr-TR", { month: "long" });

// Day heading: "Bugün  18 Ekim Pazar", "Dün  17 Ekim Cumartesi", "Salı  13 Ekim"
export function groupLabel(iso, today) {
  const d = fromIso(iso);
  const yesterday = fromIso(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const long = weekdayLong(d);
  if (iso === today) return { primary: "Bugün", secondary: dayAndMonthLong(d) + " " + long };
  if (iso === toIso(yesterday)) return { primary: "Dün", secondary: dayAndMonthLong(d) + " " + long };
  const sameYear = d.getFullYear() === fromIso(today).getFullYear();
  return { primary: long, secondary: dayAndMonthLong(d) + (sameYear ? "" : " " + d.getFullYear()) };
}
