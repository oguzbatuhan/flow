const pad = (n) => String(n).padStart(2, "0");

export const toIso = (d) => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());

export const fromIso = (s) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d, 12);
};

const weekdayLong = (d) => d.toLocaleDateString("en-US", { weekday: "long" });
const dayAndMonthLong = (d) => d.toLocaleDateString("en-US", { month: "long" }) + " " + d.getDate();

// Day heading: "Today  Sunday, October 18", "Yesterday  Saturday, October 17", "Tuesday  October 13"
export function groupLabel(iso, today) {
  const d = fromIso(iso);
  const yesterday = fromIso(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const long = weekdayLong(d);
  if (iso === today) return { primary: "Today", secondary: long + ", " + dayAndMonthLong(d) };
  if (iso === toIso(yesterday)) return { primary: "Yesterday", secondary: long + ", " + dayAndMonthLong(d) };
  const sameYear = d.getFullYear() === fromIso(today).getFullYear();
  return { primary: long, secondary: dayAndMonthLong(d) + (sameYear ? "" : ", " + d.getFullYear()) };
}
