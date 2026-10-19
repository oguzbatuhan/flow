import test from "node:test";
import assert from "node:assert/strict";
import { clockMS, human, humanMS, minutesOf, MIN_SESSION_MS } from "../src/lib/time.js";
import { groupLabel, toIso } from "../src/lib/dates.js";
import { groupByDay, mergeSessions, normalizeSessions } from "../src/lib/sessions.js";

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

test("human: day total in minutes only", () => {
  assert.equal(human(0), "0 dk");
  assert.equal(human(59000), "0 dk");
  assert.equal(human(2 * 3600000 + 15 * 60000 + 59000), "135 dk");
  assert.equal(minutesOf(3725000), 62);
});

test("minimum session is 1 second", () => {
  assert.equal(MIN_SESSION_MS, 1000);
});

const s = (id, date, ms, updatedAt = 1, extra = {}) => ({
  id, date, start: Date.parse(date + "T10:00:00"), end: Date.parse(date + "T11:00:00"), ms, deleted: false, updatedAt, ...extra,
});

test("grouping by day and totals", () => {
  const list = [s("a", "2026-10-17", 1000), s("b", "2026-10-18", 2000), s("c", "2026-10-18", 3000), s("d", "2026-10-18", 9999, 1, { deleted: true })];
  const g = groupByDay(list, "2026-10-18");
  assert.deepEqual(g.map((x) => x.date), ["2026-10-18", "2026-10-17"]);
  assert.equal(g[0].total, 5000);
  assert.equal(g[0].items.length, 2);
});

test("today is listed even without sessions", () => {
  const g = groupByDay([s("a", "2026-10-10", 1000)], "2026-10-18");
  assert.equal(g[0].date, "2026-10-18");
  assert.equal(g[0].total, 0);
});

test("sync: latest change wins, deletion flag carries over", () => {
  const T = Date.now();
  const local = [s("a", "2026-10-18", 1000, T + 5), s("b", "2026-10-18", 2000, T + 1)];
  const remote = [s("a", "2026-10-18", 1000, T + 9, { deleted: true }), s("c", "2026-10-17", 3000, T + 2)];
  const merged = mergeSessions(local, remote);
  assert.equal(merged.length, 3);
  assert.equal(merged.find((x) => x.id === "a").deleted, true);
  assert.equal(groupByDay(merged, "2026-10-18").reduce((n, g) => n + g.total, 0), 5000);
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
