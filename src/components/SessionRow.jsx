import { useEffect, useRef, useState } from "react";
import { ChevronIcon, TrashIcon } from "./Icons.jsx";
import { humanMS, hourMinute } from "../lib/time.js";

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

// reveal: play the soft fade-in (used for rows of past days that were just opened)
export function SessionRow({ session, onRemove, reveal = false }) {
  const [confirming, setConfirming] = useState(false);
  const cancelRef = useRef(null);
  const trashRef = useRef(null);
  const wasConfirming = useRef(false);

  // When confirmation is asked, focus moves to the safe option; if untouched it cancels itself
  useEffect(() => {
    if (confirming) {
      wasConfirming.current = true;
      if (cancelRef.current) cancelRef.current.focus();
      const id = setTimeout(() => setConfirming(false), CONFIRM_MS);
      return () => clearTimeout(id);
    }
    if (wasConfirming.current) {
      wasConfirming.current = false;
      if (trashRef.current) trashRef.current.focus();
    }
  }, [confirming]);

  const row = "flex min-h-[3.25rem] items-center gap-3 " + (reveal ? "task-in " : "");
  const range = hourMinute(session.start) + " – " + hourMinute(session.end);

  if (confirming) {
    return (
      <li
        className={row}
        role="alertdialog"
        aria-label={"Silme onayı: " + range}
      >
        <p className="min-w-0 flex-1">
          Silinsin mi?{" "}
          <span className="tabular text-[var(--muted)]">
            {humanMS(session.ms)}
          </span>
        </p>
        <button
          ref={cancelRef}
          type="button"
          onClick={() => setConfirming(false)}
          className="btn btn-ghost btn-sm"
        >
          Vazgeç
        </button>
        <button
          type="button"
          onClick={() => onRemove(session.id)}
          className="btn btn-warn btn-sm"
        >
          Sil
        </button>
      </li>
    );
  }

  return (
    <li className={row}>
      <span className="tabular min-w-0 flex-1 text-[var(--muted)]">
        {range}
      </span>
      <span className="tabular font-medium">{humanMS(session.ms)}</span>
      <button
        ref={trashRef}
        type="button"
        onClick={() => setConfirming(true)}
        aria-label={"Sil: " + range}
        className="icon-btn -mr-2"
      >
        <TrashIcon />
      </button>
    </li>
  );
}
