import { useEffect, useRef, useState } from "react";
import { ChevronIcon, TrashIcon } from "./Icons.jsx";
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

// Open/close button for a past day's sessions (today has none; it is always open)
export function DayToggle({ count, open, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      className="mt-3 flex w-full items-center gap-1.5 rounded-lg py-1 text-xs font-medium text-[var(--muted)] hover:text-[var(--fg)]"
    >
      <span className={"inline-flex transition-transform " + (open ? "" : "-rotate-90")}>
        <ChevronIcon dir="down" />
      </span>
      Kayıtlar
      <span className="tabular">{count}</span>
    </button>
  );
}

const CONFIRM_MS = 5000;

// A record shows what was worked on (tag) and how long. Tapping it reveals the delete button.
// reveal: play the soft fade-in (used for rows of past days that were just opened)
export function SessionRow({ session, onRemove, reveal = false }) {
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

  return (
    <li className={reveal ? "task-in" : undefined}>
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
        className="-mx-2 flex min-h-[3.25rem] cursor-pointer items-center gap-3 rounded-xl px-2 transition-colors hover:bg-[var(--hover)]"
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
}
