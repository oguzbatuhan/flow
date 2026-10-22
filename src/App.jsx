import { useEffect, useMemo, useRef, useState } from "react";
import SyncBar from "./components/SyncBar.jsx";
import TimerCard from "./components/TimerCard.jsx";
import BigClock from "./components/BigClock.jsx";
import { DayToggle, GroupHead, SessionRow } from "./components/SessionRow.jsx";
import { useDriveSync } from "./hooks/useDriveSync.js";
import { useStopwatch } from "./hooks/useStopwatch.js";
import { useWakeLock } from "./hooks/useWakeLock.js";
import { groupLabel, toIso } from "./lib/dates.js";
import { STORAGE_KEY, cleanTag, groupByDay, loadSessions, newSession, recentTags } from "./lib/sessions.js";
import { clockMS, human } from "./lib/time.js";

const FIRST_PAGE_DAYS = 14;
const TAG_KEY = "flow-tag-v1";

export default function App() {
  const [today, setToday] = useState(() => toIso(new Date()));
  const [sessions, setSessions] = useState(loadSessions);
  const [big, setBig] = useState(false);
  const [dayLimit, setDayLimit] = useState(FIRST_PAGE_DAYS);
  const sync = useDriveSync(sessions, setSessions);

  // Tag of the work in progress; kept in this browser so it survives reloads and is reused next time
  const [tag, setTagState] = useState(() => {
    try {
      const raw = localStorage.getItem(TAG_KEY) || "";
      // An earlier build stored this as JSON ({"value":"...","updatedAt":...}); read it back as plain text
      if (raw.startsWith("{")) {
        try {
          const v = cleanTag(JSON.parse(raw).value);
          localStorage.setItem(TAG_KEY, v);
          return v;
        } catch {}
      }
      return cleanTag(raw);
    } catch {
      return "";
    }
  });
  const tagRef = useRef(tag);
  tagRef.current = tag;
  const setTag = (v) => {
    setTagState(v);
    try {
      localStorage.setItem(TAG_KEY, v);
    } catch {}
  };

  // When the timer finishes, the session is saved under the day it started
  const sw = useStopwatch(({ start, end, ms }) => {
    const session = newSession({ date: toIso(new Date(start)), start, end, ms, tag: tagRef.current });
    setSessions((prev) => [...prev, session]);
  });
  // Keep the screen on while running (and while the big view is open)
  const wake = useWakeLock(sw.status === "running" || big);

  // Local copy: sessions are kept in this browser even when not connected to Drive
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch {}
  }, [sessions]);

  // Update "today" if the page stays open past midnight
  useEffect(() => {
    const check = () => setToday((prev) => (toIso(new Date()) === prev ? prev : toIso(new Date())));
    const id = setInterval(check, 60000);
    document.addEventListener("visibilitychange", check);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", check);
    };
  }, []);

  // Show the elapsed time in the tab title while active
  useEffect(() => {
    document.title = sw.status === "idle" ? "Akış" : clockMS(sw.elapsed) + " · Akış";
  }, [sw.status, sw.elapsed]);

  const groups = useMemo(() => groupByDay(sessions, today), [sessions, today]);
  const hasAny = useMemo(() => sessions.some((s) => !s.deleted), [sessions]);
  const tags = useMemo(() => recentTags(sessions), [sessions]);
  const todayGroup = groups.find((g) => g.date === today);
  const shown = groups.slice(0, dayLimit);

  // Past days start closed; today is always open. Open state is per day, so when midnight
  // passes, the day that was "today" simply falls back to closed.
  const [openDays, setOpenDays] = useState(() => new Set());
  const toggleDay = (date) =>
    setOpenDays((prev) => {
      const next = new Set(prev);
      next.has(date) ? next.delete(date) : next.add(date);
      return next;
    });

  const remove = (id) =>
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, deleted: true, updatedAt: Date.now() } : s)));

  return (
    <main className="mx-auto w-full max-w-md">
      <header className="mb-8 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl font-medium tracking-tight">Akış</h1>
          <p className="tabular mt-0.5 text-sm text-[var(--muted)]">Bugün {human(todayGroup ? todayGroup.total : 0)}</p>
        </div>
        <SyncBar sync={sync} />
      </header>

      <TimerCard sw={sw} wake={wake} tag={tag} onTag={setTag} tags={tags} onBig={() => setBig(true)} />

      {!hasAny ? (
        <p className="py-6 text-center text-sm text-[var(--muted)]">
          Henüz kayıt yok. Süreyi başlat, bitirdiğinde bugünün altına eklenir.
        </p>
      ) : (
        <div className="flex flex-col gap-9">
          {shown.map((g) => {
            const label = groupLabel(g.date, today);
            const isToday = g.date === today;
            // Today is always open; past days are open only after the user taps "Kayıtlar"
            const open = isToday || openDays.has(g.date);
            return (
              <section key={g.date}>
                <GroupHead primary={label.primary} secondary={label.secondary} total={human(g.total)} />
                {!isToday && g.items.length > 0 ? (
                  <DayToggle count={g.items.length} open={open} onToggle={() => toggleDay(g.date)} />
                ) : null}
                {g.items.length === 0 ? (
                  <p className="py-3 text-sm text-[var(--muted)]">Bugün henüz kayıt yok.</p>
                ) : open ? (
                  <ul>
                    {g.items.map((s) => (
                      <SessionRow key={s.id} session={s} onRemove={remove} reveal={!isToday} />
                    ))}
                  </ul>
                ) : null}
              </section>
            );
          })}
          {groups.length > dayLimit ? (
            <div className="flex justify-center">
              <button type="button" onClick={() => setDayLimit((n) => n + FIRST_PAGE_DAYS)} className="btn btn-ghost">
                Daha eski günler
              </button>
            </div>
          ) : null}
        </div>
      )}

      {big ? <BigClock sw={sw} wake={wake} tag={tag} onClose={() => setBig(false)} /> : null}
    </main>
  );
}
