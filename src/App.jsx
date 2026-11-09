import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import SyncBar from "./components/SyncBar.jsx";
import TimerCard from "./components/TimerCard.jsx";
import BigClock from "./components/BigClock.jsx";
import LangSwitch from "./components/LangSwitch.jsx";
import Toast from "./components/Toast.jsx";
import {
  HistoryButton,
  HistoryDay,
  HistoryEmpty,
  HistoryLoadMore,
  HistorySheet,
  HistoryStats,
  HistoryToolbar,
  MonthHead,
} from "./components/History.jsx";
import { GroupHead, SessionRow } from "./components/SessionRow.jsx";
import { useI18n } from "./i18n.jsx";
import { useCloudSync } from "./hooks/useCloudSync.js";
import { usePersist } from "./hooks/usePersist.js";
import { useStopwatch } from "./hooks/useStopwatch.js";
import { useWakeLock } from "./hooks/useWakeLock.js";
import { groupLabel, toIso } from "./lib/dates.js";
import { groupByMonth } from "./lib/history.js";
import { STORAGE_KEY, cleanTag, groupByDay, loadSessions, newSession, recentTags } from "./lib/sessions.js";
import { clockMS, human } from "./lib/time.js";

const HISTORY_PAGE_DAYS = 30;
const TAG_KEY = "flow-tag-v1";

export default function App() {
  const { lang, t } = useI18n();
  const [today, setToday] = useState(() => toIso(new Date()));
  const [sessions, setSessions] = useState(loadSessions);
  const [big, setBig] = useState(false);
  const sync = useCloudSync(sessions, setSessions);

  // Local copy: records are kept in this browser even when not connected to the cloud backup
  usePersist(STORAGE_KEY, sessions);

  // History drawer: closed by default; which days are open and how many days are loaded
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyLimit, setHistoryLimit] = useState(HISTORY_PAGE_DAYS);
  const [openDays, setOpenDays] = useState(() => new Set());

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
    const name = t("app.title");
    document.title = sw.status === "idle" ? name : clockMS(sw.elapsed) + " · " + name;
  }, [sw.status, sw.elapsed, lang, t]);

  const groups = useMemo(() => groupByDay(sessions, today), [sessions, today]);
  const hasAny = useMemo(() => sessions.some((s) => !s.deleted), [sessions]);
  const tags = useMemo(() => recentTags(sessions), [sessions]);
  const todayGroup = groups.find((g) => g.date === today);
  const todayTotal = todayGroup ? todayGroup.total : 0;
  // Everything except today goes behind the history button (groups are already newest first)
  const pastDays = useMemo(() => groups.filter((g) => g.date !== today && g.items.length > 0), [groups, today]);
  const todayLabel = groupLabel(today, today);

  // Opening starts fresh: newest day open, first page of days
  const openHistory = () => {
    setOpenDays(new Set());
    setHistoryLimit(HISTORY_PAGE_DAYS);
    setHistoryOpen(true);
  };
  const toggleDay = (date) =>
    setOpenDays((prev) => {
      const next = new Set(prev);
      next.has(date) ? next.delete(date) : next.add(date);
      return next;
    });
  // No past days left (e.g. the last one was deleted): the drawer has nothing to show
  useEffect(() => {
    if (pastDays.length === 0) setHistoryOpen(false);
  }, [pastDays.length]);

  const visibleDays = useMemo(() => (historyOpen ? pastDays.slice(0, historyLimit) : []), [historyOpen, pastDays, historyLimit]);
  const pastMonths = useMemo(() => (historyOpen ? groupByMonth(visibleDays, today) : []), [historyOpen, visibleDays, today, lang]);
  const pastTotal = useMemo(() => (historyOpen ? pastDays.reduce((n, g) => n + g.total, 0) : 0), [historyOpen, pastDays]);

  // Short message at the bottom; deleting offers "Undo"
  const [toast, setToast] = useState(null);
  const closeToast = useCallback(() => setToast(null), []);

  const setDeleted = useCallback(
    (id, deleted) => setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, deleted, updatedAt: Date.now() } : s))),
    [],
  );
  const remove = useCallback(
    (id) => {
      setDeleted(id, true);
      setToast({ key: Date.now(), message: t("toast.deleted"), undo: () => setDeleted(id, false) });
    },
    [setDeleted, t],
  );

  return (
    <main className="mx-auto w-full max-w-xl pb-16 sm:max-w-lg md:max-w-xl lg:max-w-2xl">
      <header className="mb-6 sm:mb-8">
        <div className="flex items-center justify-between gap-2">
          <p className="min-w-0 flex-1 truncate text-[13px] text-[var(--muted)]">{todayLabel.secondary}</p>
          <div className="-mr-2.5 flex shrink-0 items-center sm:-mr-2">
            <LangSwitch />
            {pastDays.length > 0 ? <HistoryButton count={pastDays.length} onClick={openHistory} /> : null}
            <SyncBar sync={sync} />
          </div>
        </div>
        <div className="mt-1.5 flex items-end justify-between gap-3 sm:mt-2">
          <h1 className="text-[2.25rem] font-semibold leading-none tracking-tight text-[var(--fg)] sm:text-[2.5rem]">
            {t("app.today")}
          </h1>
          <p className="tabular shrink-0 pb-0.5 text-[13px] font-medium text-[var(--muted)] sm:pb-1">{human(todayTotal)}</p>
        </div>
      </header>

      <div className="flex flex-col gap-6 sm:gap-8">
        <TimerCard sw={sw} wake={wake} tag={tag} onTag={setTag} tags={tags} onBig={() => setBig(true)} />

        {!hasAny ? (
          <p className="py-6 text-center text-sm text-[var(--muted)]">{t("app.noRecords")}</p>
        ) : (
          <section aria-label={t("app.todayRecords")} className="day-card">
            <GroupHead primary={todayLabel.primary} secondary={todayLabel.secondary} total={human(todayTotal)} />
            {todayGroup && todayGroup.items.length > 0 ? (
              <ul>
                {todayGroup.items.map((s) => (
                  <SessionRow key={s.id} session={s} onRemove={remove} />
                ))}
              </ul>
            ) : (
              <p className="py-3 text-sm text-[var(--muted)]">{t("app.noRecordsToday")}</p>
            )}
          </section>
        )}
      </div>

      {historyOpen && pastDays.length > 0 ? (
        <HistorySheet
          summary={<HistoryStats days={pastDays.length} time={human(pastTotal)} />}
          toolbar={
            <HistoryToolbar
              onExpand={() => setOpenDays(new Set(visibleDays.map((g) => g.date)))}
              onCollapse={() => setOpenDays(new Set())}
            />
          }
          onClose={() => setHistoryOpen(false)}
        >
          {pastMonths.length === 0 ? (
            <HistoryEmpty />
          ) : (
            pastMonths.map((m) => (
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
                      onToggle={() => toggleDay(g.date)}
                    >
                      <ul>
                        {g.items.map((s) => (
                          <SessionRow key={s.id} session={s} onRemove={remove} compact />
                        ))}
                      </ul>
                    </HistoryDay>
                  );
                })}
              </div>
            ))
          )}
          <HistoryLoadMore
            hasMore={pastDays.length > historyLimit}
            onLoadMore={() => setHistoryLimit((n) => n + HISTORY_PAGE_DAYS)}
          />
        </HistorySheet>
      ) : null}

      <Toast toast={toast} onClose={closeToast} />

      {big ? <BigClock sw={sw} wake={wake} tag={tag} onClose={() => setBig(false)} /> : null}
    </main>
  );
}
