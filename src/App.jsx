import { useEffect, useMemo, useState } from "react";
import SyncBar from "./components/SyncBar.jsx";
import TimerCard from "./components/TimerCard.jsx";
import BigClock from "./components/BigClock.jsx";
import { GroupHead, SessionRow } from "./components/SessionRow.jsx";
import { useDriveSync } from "./hooks/useDriveSync.js";
import { useStopwatch } from "./hooks/useStopwatch.js";
import { useWakeLock } from "./hooks/useWakeLock.js";
import { groupLabel, toIso } from "./lib/dates.js";
import { STORAGE_KEY, groupByDay, loadSessions, newSession } from "./lib/sessions.js";
import { clockMS, human } from "./lib/time.js";

const FIRST_PAGE_DAYS = 14;

export default function App() {
  const [today, setToday] = useState(() => toIso(new Date()));
  const [sessions, setSessions] = useState(loadSessions);
  const [big, setBig] = useState(false);
  const [dayLimit, setDayLimit] = useState(FIRST_PAGE_DAYS);
  const sync = useDriveSync(sessions, setSessions);

  // When the timer finishes, the session is saved under the day it started
  const sw = useStopwatch(({ start, end, ms }) => {
    const session = newSession({ date: toIso(new Date(start)), start, end, ms });
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
  const todayGroup = groups.find((g) => g.date === today);
  const shown = groups.slice(0, dayLimit);

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

      <TimerCard sw={sw} wake={wake} onBig={() => setBig(true)} />

      {!hasAny ? (
        <p className="py-6 text-center text-sm text-[var(--muted)]">
          Henüz kayıt yok. Süreyi başlat, bitirdiğinde bugünün altına eklenir.
        </p>
      ) : (
        <div className="flex flex-col gap-9">
          {shown.map((g) => {
            const label = groupLabel(g.date, today);
            return (
              <section key={g.date}>
                <GroupHead primary={label.primary} secondary={label.secondary} total={human(g.total)} />
                {g.items.length === 0 ? (
                  <p className="py-3 text-sm text-[var(--muted)]">Bugün henüz kayıt yok.</p>
                ) : (
                  <ul>
                    {g.items.map((s) => (
                      <SessionRow key={s.id} session={s} onRemove={remove} />
                    ))}
                  </ul>
                )}
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

      {big ? <BigClock sw={sw} wake={wake} onClose={() => setBig(false)} /> : null}
    </main>
  );
}
