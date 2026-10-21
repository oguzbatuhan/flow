// Sessions shorter than one minute are not recorded (accidental starts)
export const MIN_SESSION_MS = 60000;

export const pad = (n) => String(n).padStart(2, "0");

export const minutesOf = (ms) => Math.max(0, Math.floor(ms / 60000));

// Durations are minutes and seconds only, no hours (75 minutes shows as "75:00").
export function splitMs(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  return { m: Math.floor(total / 60), s: total % 60 };
}

// For the counter: 3725000 -> "62:05"
export function clockMS(ms) {
  const { m, s } = splitMs(ms);
  return pad(m) + ":" + pad(s);
}

// For a session row: "50 dk 12 sn", "50 dk", "40 sn", "185 dk"
export function humanMS(ms) {
  const { m, s } = splitMs(ms);
  if (m === 0) return s + " sn";
  return s === 0 ? m + " dk" : m + " dk " + s + " sn";
}

// For the day total, whole hours + remaining minutes: "2 sa 15 dk", "2 sa", "45 dk", "0 dk"
export function human(ms) {
  const total = minutesOf(ms);
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h === 0) return m + " dk";
  return m === 0 ? h + " sa" : h + " sa " + m + " dk";
}

export const hourMinute = (ts) =>
  new Date(ts).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
