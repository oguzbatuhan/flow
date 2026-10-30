import { useEffect, useMemo, useRef, useState } from "react";
import SyncBar from "./components/SyncBar.jsx";
import TimerCard from "./components/TimerCard.jsx";
import BigClock from "./components/BigClock.jsx";
import { HistoryButton, HistoryDay, HistorySheet, MonthHead } from "./components/History.jsx";
import { GroupHead, SessionRow } from "./components/SessionRow.jsx";
import { useCloudSync } from "./hooks/useCloudSync.js";
import { useStopwatch } from "./hooks/useStopwatch.js";
import { useWakeLock } from "./hooks/useWakeLock.js";
import { groupLabel, toIso } from "./lib/dates.js";
import { groupByMonth } from "./lib/history.js";
import { STORAGE_KEY, cleanTag, groupByDay, loadSessions, newSession, recentTags } from "./lib/sessions.js";
import { clockMS, human } from "./lib/time.js";

const HISTORY_PAGE_DAYS = 30;
const TAG_KEY = "flow-tag-v1";

// The hidden history: past days, newest first, grouped by month. Only the newest day starts open.
// It lives in its own component so every time the drawer opens it starts fresh.
function History({ days, today, onRemove, onClose }) {
  const [limit, setLimit] = useState(HISTORY_PAGE_DAYS);
  const [openDays, setOpenDays] = useState(() => new Set(days.length ? [days[0].date] : []));
  const toggle = (date) =>
    setOpenDays((prev) => {
      const next = new Set(prev);
      next.has(date) ? next.delete(date) : next.add(date);
      return next;
    });

  const months = useMemo(() => groupByMonth(days.slice(0, limit), today), [days, limit, today]);
  const total = days.reduce((n, g) => n + g.total, 0);

  return (
    <HistorySheet summary={days.length + " gün · " + human(total)} onClose={onClose}>
      {months.map((m) => (
        <div key={m.key}>
          <MonthHead label={m.label} meta={human(m.days.reduce((n, g) => n + g.total, 0))} />
          {m.days.map((g) => {
            const label = groupLabel(g.date, today);
            return (
              <HistoryDay
                key={g.date}
                primary={label.primary}
                secondary={label.secondary}
                meta={human(g.total)}
                open={openDays.has(g.date)}
                onToggle={() => toggle(g.date)}
              >
                <ul>
                  {g.items.map((s) => (
                    <SessionRow key={s.id} session={s} onRemove={onRemove} />
                  ))}
                </ul>
              </HistoryDay>
            );
          })}
        </div>
      ))}
      {days.length > limit ? (
        <div className="flex justify-center py-5">
          <button type="button" onClick={() => setLimit((n) => n + HISTORY_PAGE_DAYS)} className="btn btn-ghost btn-sm">
            Daha eski günler
          </button>
        </div>
      ) : null}
    </HistorySheet>
  );
}

export default function App() {
  const [today, setToday] = useState(() => toIso(new Date()));
  const [sessions, setSessions] = useState(loadSessions);
  const [big, setBig] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const sync = useCloudSync(sessions, setSessions);

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

  // Local copy: sessions are kept in this browser even when not connected to the cloud backup
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
  // Everything except today goes behind the history button (groups are already newest first)
  const pastDays = useMemo(() => groups.filter((g) => g.date !== today && g.items.length > 0), [groups, today]);
  const todayLabel = groupLabel(today, today);

  // No past days left (e.g. the last one was deleted): the drawer has nothing to show
  useEffect(() => {
    if (pastDays.length === 0) setHistoryOpen(false);
  }, [pastDays.length]);

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
        <>
          <section>
            <GroupHead
              primary={todayLabel.primary}
              secondary={todayLabel.secondary}
              total={human(todayGroup ? todayGroup.total : 0)}
            />
            {todayGroup && todayGroup.items.length > 0 ? (
              <ul>
                {todayGroup.items.map((s) => (
                  <SessionRow key={s.id} session={s} onRemove={remove} />
                ))}
              </ul>
            ) : (
              <p className="py-3 text-sm text-[var(--muted)]">Bugün henüz kayıt yok.</p>
            )}
          </section>
          {pastDays.length > 0 ? (
            <div className="mt-6 flex justify-center">
              <HistoryButton count={pastDays.length} onClick={() => setHistoryOpen(true)} />
            </div>
          ) : null}
        </>
      )}

      {historyOpen && pastDays.length > 0 ? (
        <History days={pastDays} today={today} onRemove={remove} onClose={() => setHistoryOpen(false)} />
      ) : null}

      {big ? <BigClock sw={sw} wake={wake} tag={tag} onClose={() => setBig(false)} /> : null}
    </main>
  );
}
