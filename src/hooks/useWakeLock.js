import { useEffect, useState } from "react";

// Prevents the screen from turning off while active (Screen Wake Lock API).
// The browser releases the lock when the tab is hidden; it is re-acquired when the tab returns.
export function useWakeLock(active) {
  const supported = typeof navigator !== "undefined" && "wakeLock" in navigator;
  const [held, setHeld] = useState(false);

  useEffect(() => {
    if (!supported || !active) {
      setHeld(false);
      return;
    }
    let lock = null;
    let cancelled = false;

    const acquire = async () => {
      if (document.visibilityState !== "visible" || lock) return;
      try {
        const l = await navigator.wakeLock.request("screen");
        if (cancelled) {
          l.release().catch(() => {});
          return;
        }
        lock = l;
        setHeld(true);
        l.addEventListener("release", () => {
          if (lock === l) {
            lock = null;
            setHeld(false);
          }
        });
      } catch {
        setHeld(false);
      }
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") acquire();
    };

    acquire();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisible);
      if (lock) {
        const l = lock;
        lock = null;
        l.release().catch(() => {});
      }
      setHeld(false);
    };
  }, [active, supported]);

  return { supported, held };
}
