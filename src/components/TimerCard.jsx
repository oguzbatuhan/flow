import { useEffect, useRef, useState } from "react";
import Controls from "./Controls.jsx";
import Digits from "./Digits.jsx";
import StatusPill from "./StatusPill.jsx";
import { ExpandIcon, TagIcon } from "./Icons.jsx";
import { MAX_TAG_LENGTH, cleanTag } from "../lib/sessions.js";
import { useI18n } from "../i18n.jsx";

const CONFIRM_MS = 5000;

// The timer card on the main screen: status, big counter, tag, controls
export default function TimerCard({ sw, wake, tag, onTag, tags, onBig }) {
  const { t } = useI18n();
  const [confirming, setConfirming] = useState(false);
  const cancelRef = useRef(null);

  // Discard confirmation: if untouched it cancels itself
  useEffect(() => {
    if (!confirming) return;
    if (cancelRef.current) cancelRef.current.focus();
    const id = setTimeout(() => setConfirming(false), CONFIRM_MS);
    return () => clearTimeout(id);
  }, [confirming]);

  useEffect(() => {
    if (sw.status !== "paused") setConfirming(false);
  }, [sw.status]);

  const running = sw.status === "running";

  return (
    <section
      aria-label={t("timer.aria")}
      className={"day-card px-4 pb-5 pt-4 text-center sm:px-6 " + (running ? "day-card-today" : "")}
    >
      <div className="flex items-center justify-between">
        <StatusPill status={sw.status} />
        <button
          type="button"
          onClick={onBig}
          className="icon-btn -mr-2"
          aria-label={t("timer.bigScreen")}
          title={t("timer.bigScreen")}
        >
          <ExpandIcon />
        </button>
      </div>

      <Digits
        ms={sw.elapsed}
        running={running}
        className="mb-6 mt-5"
        style={{ fontSize: "clamp(3.25rem, 16vw, 5.75rem)" }}
      />

      <div className="mb-6">
        <label className="mx-auto flex h-11 max-w-[16rem] items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface-2)] px-4 text-[var(--muted)] transition-colors focus-within:border-[var(--accent)] hover:border-[var(--line-strong)]">
          <TagIcon />
          <input
            type="text"
            value={tag}
            onChange={(e) => onTag(e.target.value.slice(0, MAX_TAG_LENGTH))}
            onBlur={() => onTag(cleanTag(tag))}
            maxLength={MAX_TAG_LENGTH}
            autoComplete="off"
            enterKeyHint="done"
            aria-label={t("timer.tag")}
            placeholder={t("timer.tagPlaceholder")}
            className="min-w-0 flex-1 bg-transparent text-center text-base text-[var(--fg)] outline-none placeholder:text-[var(--muted-2)] sm:text-[0.9375rem]"
          />
        </label>
        {tags.length > 0 ? (
          <div className="mt-3 flex flex-wrap justify-center gap-1.5" role="group" aria-label={t("timer.recentTags")}>
            {tags.map((x) => {
              const on = x.toLocaleLowerCase("en") === tag.trim().toLocaleLowerCase("en");
              return (
                <button
                  key={x}
                  type="button"
                  aria-pressed={on}
                  onClick={() => onTag(on ? "" : x)}
                  className={
                    "h-8 max-w-[10rem] truncate rounded-full border px-3.5 text-xs font-medium transition-colors " +
                    (on
                      ? "border-transparent bg-[var(--accent-soft)] text-[var(--accent)]"
                      : "border-[var(--line)] text-[var(--muted)] hover:bg-[var(--hover)] hover:text-[var(--fg)]")
                  }
                >
                  {x}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      <Controls sw={sw} />

      <div className="mt-4 flex min-h-8 items-center justify-center gap-2 text-[0.8125rem] text-[var(--muted)]">
        {sw.status === "paused" ? (
          confirming ? (
            <>
              <span>{t("timer.discardQ")}</span>
              <button ref={cancelRef} type="button" onClick={() => setConfirming(false)} className="btn btn-ghost btn-sm">
                {t("common.cancel")}
              </button>
              <button type="button" onClick={sw.discard} className="btn btn-warn btn-sm">
                {t("timer.discard")}
              </button>
            </>
          ) : (
            <button type="button" onClick={() => setConfirming(true)} className="link-btn">
              {t("timer.discardLink")}
            </button>
          )
        ) : running ? (
          wake.supported ? (
            <span>{wake.held ? t("timer.screenOn") : t("timer.keepOpen")}</span>
          ) : (
            <span className="text-[var(--warn)]">{t("timer.noWake")}</span>
          )
        ) : null}
      </div>
    </section>
  );
}
