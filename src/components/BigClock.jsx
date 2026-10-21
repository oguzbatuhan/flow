import { useEffect, useRef } from "react";
import Controls from "./Controls.jsx";
import Digits from "./Digits.jsx";
import { CloseIcon } from "./Icons.jsx";
import { splitMs } from "../lib/time.js";

const STATUS_TEXT = {
  idle: "Hazır",
  running: "Çalışıyor",
  paused: "Duraklatıldı",
};

// Full-screen big counter. Uses real fullscreen when the browser supports it,
// otherwise (e.g. iPhone Safari) it opens as an overlay covering the page.
export default function BigClock({ sw, wake, tag, onClose }) {
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

  const dot =
    sw.status === "running"
      ? "bg-[var(--accent)]"
      : sw.status === "paused"
        ? "bg-[var(--warn)]"
        : "bg-[var(--line-strong)]";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Büyük sayaç"
      className="fixed inset-0 z-50 flex flex-col bg-[var(--bg)] text-[var(--fg)]"
      style={{
        paddingTop: "max(16px, env(safe-area-inset-top, 0px))",
        paddingBottom: "max(28px, env(safe-area-inset-bottom, 0px))",
        paddingLeft: "max(20px, env(safe-area-inset-left, 0px))",
        paddingRight: "max(20px, env(safe-area-inset-right, 0px))",
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="pt-2">
          <p className="flex items-center gap-2 text-sm text-[var(--muted)]">
            <span className={"h-1.5 w-1.5 rounded-full " + dot} aria-hidden="true"></span>
            <span role="status">{STATUS_TEXT[sw.status]}</span>
          </p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            {wake.supported
              ? wake.held
                ? "Ekran açık kalıyor"
                : "Ekran kilidi bekleniyor"
              : "Bu tarayıcı ekranı açık tutamıyor"}
          </p>
        </div>
        <button type="button" onClick={onClose} aria-label="Büyük ekranı kapat" title="Kapat" className="icon-btn">
          <CloseIcon />
        </button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        {tag ? (
          <p className="max-w-full truncate rounded-full bg-[var(--accent-soft)] px-3.5 py-1 text-sm font-medium text-[var(--accent)]">
            {tag}
          </p>
        ) : null}
        <Digits ms={sw.elapsed} running={sw.status === "running"} className="select-none" style={{ fontSize }} />
      </div>

      <Controls sw={sw} size="big" />
    </div>
  );
}
