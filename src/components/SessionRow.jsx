import { useEffect, useRef, useState } from "react";
import { TrashIcon } from "./Icons.jsx";
import { humanMS, hourMinute } from "../lib/time.js";

// Day heading: the day on the left, that day's total on the right
export function GroupHead({ primary, secondary, total }) {
  return (
    <h2 className="flex items-baseline gap-2 border-b border-[var(--line-strong)] pb-2 text-sm">
      <span className="font-medium">{primary}</span>
      {secondary ? <span className="text-[var(--muted)]">{secondary}</span> : null}
      <span className="flex-1" aria-hidden="true"></span>
      <span className="tabular font-medium">{total}</span>
    </h2>
  );
}

const CONFIRM_MS = 5000;

export function SessionRow({ session, onRemove }) {
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

  const row = "flex min-h-[3.25rem] items-center gap-3 border-b border-[var(--line)] text-sm last:border-b-0 ";
  const range = hourMinute(session.start) + " – " + hourMinute(session.end);

  if (confirming) {
    return (
      <li className={row} role="alertdialog" aria-label={"Silme onayı: " + range}>
        <p className="min-w-0 flex-1">
          Silinsin mi? <span className="tabular text-[var(--muted)]">{humanMS(session.ms)}</span>
        </p>
        <button ref={cancelRef} type="button" onClick={() => setConfirming(false)} className="btn btn-ghost btn-sm">
          Vazgeç
        </button>
        <button type="button" onClick={() => onRemove(session.id)} className="btn btn-warn btn-sm">
          Sil
        </button>
      </li>
    );
  }

  return (
    <li className={row}>
      <span className="tabular min-w-0 flex-1 text-[var(--muted)]">{range}</span>
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
