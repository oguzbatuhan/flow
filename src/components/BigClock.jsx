import { useEffect, useRef } from "react";
import Controls from "./Controls.jsx";
import Digits from "./Digits.jsx";
import StatusPill from "./StatusPill.jsx";
import { CloseIcon } from "./Icons.jsx";
import { useI18n } from "../i18n.jsx";
import { splitMs } from "../lib/time.js";

// Full-screen big counter. Uses real fullscreen when the browser supports it,
// otherwise (e.g. iPhone Safari) it opens as an overlay covering the page.
export default function BigClock({ sw, wake, tag, onClose }) {
  const { t } = useI18n();
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const enteredFullscreen = useRef(false);

  useEffect(() => {
    const el = document.documentElement;
    if (el.requestFullscreen) {
      el.requestFullscreen()
        .then(() => {
          enteredFullscreen.current = true;
        })
        .catch(() => {});
    }
    // If fullscreen is exited with Esc, the big view closes too
    const onFullscreen = () => {
      if (!document.fullscreenElement && enteredFullscreen.current) {
        enteredFullscreen.current = false;
        closeRef.current();
      }
    };
    const onKey = (e) => {
      if (e.key === "Escape") closeRef.current();
    };
    document.addEventListener("fullscreenchange", onFullscreen);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreen);
      document.removeEventListener("keydown", onKey);
      if (document.fullscreenElement) {
        enteredFullscreen.current = false;
        document.exitFullscreen().catch(() => {});
      }
    };
  }, []);

  // Digits scale with the screen: they shrink as the digit count grows (past 100 minutes) so they always fit
  const { m } = splitMs(sw.elapsed);
  const chars = Math.max(2, String(m).length) + 2;
  const widthEm = chars * 0.62 + 0.1;
  const fontSize = "min(" + (84 / widthEm).toFixed(1) + "vw, 38vh)";

  const running = sw.status === "running";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t("big.aria")}
      className="fixed inset-0 z-50 flex flex-col bg-[var(--bg)] text-[var(--fg)]"
      style={{
        paddingTop: "max(16px, env(safe-area-inset-top, 0px))",
        paddingBottom: "max(28px, env(safe-area-inset-bottom, 0px))",
        paddingLeft: "max(20px, env(safe-area-inset-left, 0px))",
        paddingRight: "max(20px, env(safe-area-inset-right, 0px))",
      }}
    >
      {/* Soft glow behind the counter while running */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-opacity duration-700"
        style={{
          opacity: running ? 1 : 0,
          background: "radial-gradient(60% 45% at 50% 50%, var(--accent-soft), transparent 70%)",
        }}
      />

      <div className="relative flex items-start justify-between gap-4">
        <div className="flex flex-col items-start gap-2 pt-1">
          <StatusPill status={sw.status} />
          <p className="px-1 text-xs text-[var(--muted-2)]">
            {wake.supported ? (wake.held ? t("timer.screenOn") : t("big.waiting")) : t("big.noWake")}
          </p>
        </div>
        <button type="button" onClick={onClose} aria-label={t("big.close")} title={t("common.close")} className="icon-btn">
          <CloseIcon />
        </button>
      </div>

      <div className="relative flex flex-1 flex-col items-center justify-center gap-5">
        {tag ? (
          <p className="max-w-full truncate rounded-full bg-[var(--accent-soft)] px-4 py-1.5 text-sm font-medium text-[var(--accent)]">
            {tag}
          </p>
        ) : null}
        <Digits ms={sw.elapsed} running={running} className="select-none" style={{ fontSize }} />
      </div>

      <div className="relative">
        <Controls sw={sw} size="big" />
      </div>
    </div>
  );
}
