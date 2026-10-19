export const STORAGE_KEY = "flow-sessions-v1";

// Deleted sessions are not removed right away; they are kept for a while with a "deleted" flag
// so the deletion reaches other devices too. Flags older than 30 days are purged.
const TOMBSTONE_MS = 30 * 24 * 60 * 60 * 1000;

export function uid() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

// date: day the session started (YYYY-MM-DD) · start/end: timestamps · ms: net duration with pauses removed
export function newSession({ date, start, end, ms }) {
  return { id: uid(), date, start, end, ms, deleted: false, updatedAt: Date.now() };
}

export function normalizeSessions(list) {
  if (!Array.isArray(list)) return [];
  return list
    .filter(
      (s) =>
        s &&
        typeof s.id === "string" &&
        typeof s.date === "string" &&
        Number.isFinite(Number(s.ms)) &&
        Number(s.ms) >= 0
    )
    .map((s) => ({
      id: s.id,
      date: s.date,
      start: Number(s.start) || 0,
      end: Number(s.end) || 0,
      ms: Number(s.ms),
      deleted: Boolean(s.deleted),
      updatedAt: Number(s.updatedAt) || 0,
    }));
}

export function loadSessions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? normalizeSessions(JSON.parse(raw)) : [];
  } catch {
    return [];
  }
}

export const sortById = (list) => [...list].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));

export const sameSessions = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// If the same session changed in two places, the latest change (larger updatedAt) wins.
export function mergeSessions(local, remote) {
  const byId = new Map();
  for (const s of [...normalizeSessions(local), ...normalizeSessions(remote)]) {
    const current = byId.get(s.id);
    if (!current || s.updatedAt > current.updatedAt) byId.set(s.id, s);
  }
  const cutoff = Date.now() - TOMBSTONE_MS;
  const kept = [...byId.values()].filter((s) => !(s.deleted && s.updatedAt < cutoff));
  return sortById(kept);
}

// Groups by day: newest day first, newest session first within a day.
// If "today" is given it is included even when it has no sessions.
export function groupByDay(sessions, today) {
  const map = new Map();
  for (const s of sessions) {
    if (s.deleted) continue;
    if (!map.has(s.date)) map.set(s.date, []);
    map.get(s.date).push(s);
  }
  if (today && !map.has(today)) map.set(today, []);
  return [...map.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([date, items]) => {
      const sorted = [...items].sort((a, b) => b.start - a.start);
      return { date, items: sorted, total: sorted.reduce((n, s) => n + s.ms, 0) };
    });
}
