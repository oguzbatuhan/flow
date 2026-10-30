import test from "node:test";
import assert from "node:assert/strict";
import { clockMS, human, humanMS, minutesOf, MIN_SESSION_MS } from "../src/lib/time.js";
import { groupLabel, toIso } from "../src/lib/dates.js";
import { cleanTag, groupByDay, mergeSessions, normalizeSessions, newSession, recentTags } from "../src/lib/sessions.js";
import { groupByMonth, monthKey, monthLabel } from "../src/lib/history.js";

test("clockMS: minutes and seconds, no hours", () => {
  assert.equal(clockMS(0), "00:00");
  assert.equal(clockMS(999), "00:00");
  assert.equal(clockMS(5000), "00:05");
  assert.equal(clockMS(65000), "01:05");
  assert.equal(clockMS(3725000), "62:05");
  assert.equal(clockMS(100 * 60000 + 7000), "100:07");
  assert.equal(clockMS(-5), "00:00");
});

test("humanMS: session row", () => {
  assert.equal(humanMS(0), "0 sn");
  assert.equal(humanMS(40000), "40 sn");
  assert.equal(humanMS(50 * 60000), "50 dk");
  assert.equal(humanMS(50 * 60000 + 12000), "50 dk 12 sn");
  assert.equal(humanMS(3 * 3600000 + 5 * 60000), "185 dk");
});

test("human: day total in hours and minutes", () => {
  assert.equal(human(0), "0 dk");
  assert.equal(human(59000), "0 dk");
  assert.equal(human(45 * 60000), "45 dk");
  assert.equal(human(2 * 3600000), "2 sa");
  assert.equal(human(2 * 3600000 + 15 * 60000 + 59000), "2 sa 15 dk");
  assert.equal(minutesOf(3725000), 62);
});

test("minimum session is 1 minute", () => {
  assert.equal(MIN_SESSION_MS, 60000);
});

const M = 60000;
const s = (id, date, ms, updatedAt = 1, extra = {}) => ({
  id, date, start: Date.parse(date + "T10:00:00"), end: Date.parse(date + "T11:00:00"), ms, deleted: false, updatedAt, ...extra,
});

test("grouping by day and totals", () => {
  const list = [s("a", "2026-10-17", 1 * M), s("b", "2026-10-18", 2 * M), s("c", "2026-10-18", 3 * M), s("d", "2026-10-18", 9 * M, 1, { deleted: true }), s("e", "2026-10-18", 30000)];
  const g = groupByDay(list, "2026-10-18");
  assert.deepEqual(g.map((x) => x.date), ["2026-10-18", "2026-10-17"]);
  assert.equal(g[0].total, 5 * M);
  assert.equal(g[0].items.length, 2);
});

test("today is listed even without sessions", () => {
  const g = groupByDay([s("a", "2026-10-10", M)], "2026-10-18");
  assert.equal(g[0].date, "2026-10-18");
  assert.equal(g[0].total, 0);
});

test("sync: latest change wins, deletion flag carries over", () => {
  const T = Date.now();
  const local = [s("a", "2026-10-18", M, T + 5), s("b", "2026-10-18", 2 * M, T + 1)];
  const remote = [s("a", "2026-10-18", M, T + 9, { deleted: true }), s("c", "2026-10-17", 3 * M, T + 2)];
  const merged = mergeSessions(local, remote);
  assert.equal(merged.length, 3);
  assert.equal(merged.find((x) => x.id === "a").deleted, true);
  assert.equal(groupByDay(merged, "2026-10-18").reduce((n, g) => n + g.total, 0), 5 * M);
});

test("deletion flags older than 30 days are purged", () => {
  const old = Date.now() - 31 * 24 * 60 * 60 * 1000;
  const merged = mergeSessions([s("a", "2026-09-01", 1000, old, { deleted: true }), s("b", "2026-09-01", 2000, old)], []);
  assert.deepEqual(merged.map((x) => x.id), ["b"]);
});

test("corrupt records are dropped", () => {
  assert.equal(normalizeSessions([{ id: 1 }, null, { id: "x", date: "2026-10-18", ms: "abc" }, s("ok", "2026-10-18", 5)]).length, 1);
  assert.deepEqual(normalizeSessions("invalid"), []);
});

test("day heading", () => {
  assert.equal(groupLabel("2026-10-18", "2026-10-18").primary, "Bugün");
  assert.equal(groupLabel("2026-10-17", "2026-10-18").primary, "Dün");
  assert.equal(groupLabel("2026-10-13", "2026-10-18").primary, "Salı");
  assert.equal(toIso(new Date(2026, 9, 5)), "2026-10-05");
});

test("tags: cleaned, stored on sessions and listed by recency", () => {
  assert.equal(cleanTag("  Matematik   çalışma "), "Matematik çalışma");
  assert.equal(cleanTag("x".repeat(50)).length, 30);
  assert.equal(cleanTag(undefined), "");
  assert.equal(newSession({ date: "2026-10-18", start: 1, end: 2, ms: M, tag: " Kod " }).tag, "Kod");
  // Old records without a tag load as untagged
  assert.equal(normalizeSessions([s("o", "2026-10-18", M)])[0].tag, "");
  const list = [s("a", "2026-10-17", M, 1, { tag: "Kod", start: 1 }), s("b", "2026-10-18", M, 1, { tag: "Matematik", start: 5 }), s("c", "2026-10-18", M, 1, { tag: "kod", start: 9 }), s("d", "2026-10-18", M, 1, { start: 10 })];
  assert.deepEqual(recentTags(list), ["kod", "Matematik"]);
});

test("sync: same change time never loses the tag", () => {
  const withTag = { id: "a", date: "2026-10-22", start: 1, end: 2, ms: 60000, tag: "Matematik", deleted: false, updatedAt: 100 };
  const noTag = { ...withTag, tag: "" };
  assert.equal(mergeSessions([noTag], [withTag])[0].tag, "Matematik");
  assert.equal(mergeSessions([withTag], [noTag])[0].tag, "Matematik");
});

test("history: monthKey and monthLabel", () => {
  assert.equal(monthKey("2026-10-18"), "2026-10");
  // Same year as today: month name only; any other year: name and year
  assert.equal(monthLabel("2026-10", "2026-10-30"), "Ekim");
  assert.equal(monthLabel("2025-12", "2026-10-30"), "Aralık 2025");
});

test("history: groupByMonth keeps newest-first order and splits by month", () => {
  const days = [
    { date: "2026-10-29" },
    { date: "2026-10-02" },
    { date: "2026-09-30" },
    { date: "2025-12-31" },
  ];
  const groups = groupByMonth(days, "2026-10-30");
  assert.deepEqual(
    groups.map((g) => [g.key, g.label, g.days.map((d) => d.date)]),
    [
      ["2026-10", "Ekim", ["2026-10-29", "2026-10-02"]],
      ["2026-09", "Eylül", ["2026-09-30"]],
      ["2025-12", "Aralık 2025", ["2025-12-31"]],
    ]
  );
  assert.deepEqual(groupByMonth([], "2026-10-30"), []);
});
