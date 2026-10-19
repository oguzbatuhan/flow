import { useCallback, useEffect, useRef, useState } from "react";
import { MIN_SESSION_MS } from "../lib/time.js";

const KEY = "flow-stopwatch-v1";
const TICK_MS = 250;
const EMPTY = { sessionStart: null, acc: 0, startedAt: null };

// Elapsed time is computed from timestamps, not by incrementing a counter.
// It stays correct even if the tab is throttled in the background, the screen locks or the page reloads.
function load() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) || "null");
    if (s && Number.isFinite(s.sessionStart) && Number.isFinite(s.acc)) {
      return {
        sessionStart: s.sessionStart,
        acc: Math.max(0, s.acc),
        startedAt: Number.isFinite(s.startedAt) ? s.startedAt : null,
      };
    }
  } catch {}
  return EMPTY;
}

// status: "idle" | "running" | "paused"
// onFinish({ start, end, ms }) is called when the timer is finished and saved
export function useStopwatch(onFinish) {
  const [state, setState] = useState(load);
  const [now, setNow] = useState(() => Date.now());
  const ref = useRef(state);
  const finishRef = useRef(onFinish);
  finishRef.current = onFinish;

  const commit = useCallback((next) => {
    ref.current = next;
    setState(next);
  }, []);

  // After a reload the timer resumes where it left off
  useEffect(() => {
    try {
      if (state.sessionStart == null) localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, JSON.stringify(state));
    } catch {}
  }, [state]);

  const running = state.startedAt != null;
  useEffect(() => {
    if (!running) return;
    const tick = () => setNow(Date.now());
    tick();
    const id = setInterval(tick, TICK_MS);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [running]);

  const status = state.sessionStart == null ? "idle" : running ? "running" : "paused";
  const elapsed = state.acc + (running ? Math.max(0, now - state.startedAt) : 0);

  const start = useCallback(() => {
    if (ref.current.sessionStart != null) return;
    const t = Date.now();
    setNow(t);
    commit({ sessionStart: t, acc: 0, startedAt: t });
  }, [commit]);

  const pause = useCallback(() => {
    const s = ref.current;
    if (s.startedAt == null) return;
    commit({ ...s, acc: s.acc + (Date.now() - s.startedAt), startedAt: null });
  }, [commit]);

  const resume = useCallback(() => {
    const s = ref.current;
    if (s.sessionStart == null || s.startedAt != null) return;
    const t = Date.now();
    setNow(t);
    commit({ ...s, startedAt: t });
  }, [commit]);

  const finish = useCallback(() => {
    const s = ref.current;
    if (s.sessionStart == null) return;
    const end = Date.now();
    const ms = s.acc + (s.startedAt != null ? end - s.startedAt : 0);
    commit(EMPTY);
    // Attempts shorter than one second are not recorded
    if (ms >= MIN_SESSION_MS) finishRef.current({ start: s.sessionStart, end, ms });
  }, [commit]);

  const discard = useCallback(() => commit(EMPTY), [commit]);

  return { status, elapsed, start, pause, resume, finish, discard };
}
