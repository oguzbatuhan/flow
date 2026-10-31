import { memo, useEffect, useRef, useState } from "react";
import { TrashIcon } from "./Icons.jsx";
import { hourMinute, human } from "../lib/time.js";

// Day heading: the day on the left, that day's total on the right
export function GroupHead({ primary, secondary, total }) {
  return (
    <h2 className="flex items-baseline gap-2 border-b border-[var(--line-strong)] pb-2 text-sm">
      <span className="font-medium">{primary}</span>
      {secondary ? (
        <span className="text-[var(--muted)]">{secondary}</span>
      ) : null}
      <span className="flex-1" aria-hidden="true"></span>
      <span className="tabular font-medium">{total}</span>
    </h2>
  );
}

const CONFIRM_MS = 5000;

// A record shows what was worked on (tag) and how long. Tapping it reveals the delete button.
// reveal: play the soft fade-in (used for rows of past days that were just opened)
export const SessionRow = memo(function SessionRow({ session, onRemove, reveal = false }) {
  // "closed" | "open" (delete button visible) | "confirm" (asking "Silinsin mi?")
  const [mode, setMode] = useState("closed");
  const cancelRef = useRef(null);
  const delRef = useRef(null);
  const prevMode = useRef("closed");

  // Focus the safe option when confirmation is asked; if untouched it goes back to "open"
  useEffect(() => {
    if (mode === "confirm") {
      if (cancelRef.current) cancelRef.current.focus();
      const id = setTimeout(() => setMode("open"), CONFIRM_MS);
      return () => clearTimeout(id);
    }
    if (mode === "open" && prevMode.current === "confirm" && delRef.current) delRef.current.focus();
  }, [mode]);
  useEffect(() => {
    prevMode.current = mode;
  });

  const label = session.tag || "Etiketsiz";
  const open = mode !== "closed";

  // While open, a tap anywhere outside this record closes it. Listens to "click", not "pointerdown": closing on press
  // shrinks the list under the finger, so the tap would land on another row and the new row would not open.
  const rootRef = useRef(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      // composedPath is captured when the click starts, so it still works when the clicked button (Sil) was
      // removed from the page by the re-render before this listener ran
      const inside = rootRef.current && e.composedPath().includes(rootRef.current);
      if (!inside) setMode("closed");
    };
    document.addEventListener("click", onDown);
    return () => document.removeEventListener("click", onDown);
  }, [open]);

  return (
    <li
      ref={rootRef}
      className={
        "-mx-2 rounded-xl border px-[calc(0.5rem-1px)] transition-colors " +
        (open ? "border-[var(--line-strong)] bg-[var(--surface)]" : "border-transparent hover:bg-[var(--hover)]") +
        (reveal ? " task-in" : "")
      }
    >
      <div
        role="button"
        tabIndex={0}
        aria-expanded={open}
        aria-label={label + ", " + human(session.ms)}
        onClick={() => setMode(open ? "closed" : "open")}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setMode(open ? "closed" : "open");
          }
        }}
        className="flex min-h-[3.25rem] cursor-pointer items-center gap-3 rounded-xl"
      >
        <span
          className={
            "min-w-0 flex-1 truncate " +
            (session.tag ? "font-medium" : "text-[var(--muted)]")
          }
        >
          {label}
        </span>
        <span className="tabular text-[var(--muted)]">{human(session.ms)}</span>
      </div>

      {open ? (
        <div className="task-in flex min-h-[2.5rem] items-center gap-2 pb-2">
          {mode === "confirm" ? (
            <div role="alertdialog" aria-label={"Silme onayı: " + label} className="flex w-full items-center gap-2">
              <span className="flex-1 text-sm">Silinsin mi?</span>
              <button ref={cancelRef} type="button" onClick={() => setMode("open")} className="btn btn-ghost btn-sm">
                Vazgeç
              </button>
              <button type="button" onClick={() => onRemove(session.id)} className="btn btn-warn btn-sm">
                Sil
              </button>
            </div>
          ) : (
            <>
              <span className="tabular min-w-0 flex-1 text-sm text-[var(--muted)]">
                {hourMinute(session.start) + " – " + hourMinute(session.end)}
              </span>
              <button
                ref={delRef}
                type="button"
                onClick={() => setMode("confirm")}
                className="btn btn-sm min-w-0 gap-1.5 border-[var(--line-strong)] text-[var(--warn)] hover:bg-[var(--hover)]"
              >
                <TrashIcon />
                Sil
              </button>
            </>
          )}
        </div>
      ) : null}
    </li>
  );
});
