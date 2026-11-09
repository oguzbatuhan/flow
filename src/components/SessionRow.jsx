import { memo, useEffect, useRef, useState } from "react";
import { TagIcon } from "./Icons.jsx";
import { hourMinute, human } from "../lib/time.js";
import { useI18n } from "../i18n.jsx";

// Day heading (same look as the task app's day heading): day on the left, that day's total on the right
export function GroupHead({ primary, secondary, total }) {
  return (
    <div className="pb-1">
      <h2 className="flex items-baseline gap-2 px-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--fg)]">{primary}</span>
        {secondary ? <span className="min-w-0 truncate text-xs text-[var(--muted)]">{secondary}</span> : null}
        <span className="flex-1" aria-hidden="true"></span>
        <span className="tabular text-xs font-medium text-[var(--accent)]">{total}</span>
      </h2>
    </div>
  );
}

const CONFIRM_MS = 5000;

// A record shows what was worked on (tag) and how long. Tapping it opens the time range and the delete button.
export const SessionRow = memo(function SessionRow({ session, onRemove, compact = false }) {
  const { t } = useI18n();
  // "closed" | "open" (info + delete) | "confirm" (asking "Delete?")
  const [mode, setMode] = useState("closed");
  const cancelRef = useRef(null);
  const delRef = useRef(null);
  const prevMode = useRef("closed");
  const rootRef = useRef(null);

  // Focus the safe option when confirmation is asked; if untouched it goes back to "open"
  useEffect(() => {
    if (mode === "confirm") {
      cancelRef.current?.focus();
      const id = setTimeout(() => setMode("open"), CONFIRM_MS);
      return () => clearTimeout(id);
    }
    if (mode === "open" && prevMode.current === "confirm") delRef.current?.focus();
  }, [mode]);
  useEffect(() => {
    prevMode.current = mode;
  });

  const label = session.tag || t("session.untagged");
  const open = mode !== "closed";

  // While open, a tap anywhere outside this record closes it. Listens to "click" (not "pointerdown") so the list does
  // not shrink under the finger before the tap lands; composedPath still counts the Delete button as inside.
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      const inside = rootRef.current && e.composedPath().includes(rootRef.current);
      if (!inside) setMode("closed");
    };
    document.addEventListener("click", onDown);
    return () => document.removeEventListener("click", onDown);
  }, [open]);

  const toggle = () => setMode((m) => (m === "closed" ? "open" : "closed"));

  return (
    <li
      ref={rootRef}
      className={"task-row my-0.5 text-sm " + (open ? "bg-[var(--hover)]" : "")}
    >
      <div
        role="button"
        tabIndex={0}
        aria-expanded={open}
        aria-label={label + ", " + human(session.ms)}
        onClick={toggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggle();
          }
        }}
        className="flex min-h-[3.25rem] cursor-pointer items-center gap-3 px-1"
      >
        {compact ? null : <span
          className={
            "flex h-[1.875rem] w-[1.875rem] shrink-0 items-center justify-center rounded-full " +
            (session.tag ? "bg-[var(--accent-soft)] text-[var(--accent)]" : "bg-[var(--surface-2)] text-[var(--muted-2)]")
          }
          aria-hidden="true"
        >
          <TagIcon />
        </span>}
        <span
          className={
            "min-w-0 flex-1 truncate " + (compact ? "pl-1 text-[0.9375rem] " : "text-base ") + " leading-snug " +
            (session.tag ? "text-[var(--fg)]" : "text-[var(--muted)]")
          }
        >
          {label}
        </span>
        <span className="tabular shrink-0 pr-1 text-sm font-medium text-[var(--muted)]">{human(session.ms)}</span>
      </div>

      {open ? (
        <div className="task-in flex items-center gap-3 pb-2.5 pl-4 pr-4">
          {mode === "confirm" ? (
            <div role="alertdialog" aria-label={t("session.confirmDeletion", { label })} className="flex w-full items-center gap-3">
              <span className="min-w-0 flex-1 text-sm text-[var(--muted)]">{t("session.deleteQ")}</span>
              <button ref={cancelRef} type="button" onClick={() => setMode("open")} className="link-btn">
                {t("common.cancel")}
              </button>
              <button
                type="button"
                onClick={() => onRemove(session.id)}
                className="link-btn text-[var(--warn)] hover:text-[var(--warn)]"
              >
                {t("common.delete")}
              </button>
            </div>
          ) : (
            <>
              <span className="tabular min-w-0 flex-1 truncate text-xs text-[var(--muted)]">
                {hourMinute(session.start) + " – " + hourMinute(session.end)}
              </span>
              <button
                ref={delRef}
                type="button"
                onClick={() => setMode("confirm")}
                className="link-btn text-[var(--warn)] hover:text-[var(--warn)]"
              >
                {t("common.delete")}
              </button>
            </>
          )}
        </div>
      ) : null}
    </li>
  );
});
