import { useEffect, useRef, useState } from "react";
import Controls from "./Controls.jsx";
import Digits from "./Digits.jsx";
import { ExpandIcon, TagIcon } from "./Icons.jsx";
import { MAX_TAG_LENGTH, cleanTag } from "../lib/sessions.js";

const CONFIRM_MS = 5000;

const STATUS_TEXT = {
  idle: "Hazır",
  running: "Çalışıyor",
  paused: "Duraklatıldı",
};

export default function TimerCard({ sw, wake, tag, onTag, tags, onBig }) {
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

  const dot =
    sw.status === "running"
      ? "bg-[var(--accent)]"
      : sw.status === "paused"
        ? "bg-[var(--warn)]"
        : "bg-[var(--line-strong)]";

  return (
    <section aria-label="Akış" className="pb-5 text-center">
      <div className="flex h-9 items-center justify-between">
        <p className="flex items-center gap-2 text-sm text-[var(--muted)]">
          <span
            className={"h-1.5 w-1.5 rounded-full " + dot}
            aria-hidden="true"
          ></span>
          <span role="status">{STATUS_TEXT[sw.status]}</span>
        </p>
        <button
          type="button"
          onClick={onBig}
          className="icon-btn"
          aria-label="Büyük ekran"
          title="Büyük ekran"
        >
          <ExpandIcon />
        </button>
      </div>

      <Digits
        ms={sw.elapsed}
        running={sw.status === "running"}
        className="mb-5 mt-7"
        style={{ fontSize: "clamp(3rem, 15vw, 5.5rem)" }}
      />

      <div className="mb-6">
        <label className="mx-auto flex h-10 max-w-[15rem] items-center gap-2 rounded-full border border-[var(--line-strong)] bg-[var(--surface)] px-4 text-[var(--muted)] transition-colors focus-within:border-[var(--accent)]">
          <TagIcon />
          <input
            type="text"
            value={tag}
            onChange={(e) => onTag(e.target.value.slice(0, MAX_TAG_LENGTH))}
            onBlur={() => onTag(cleanTag(tag))}
            maxLength={MAX_TAG_LENGTH}
            autoComplete="off"
            enterKeyHint="done"
            aria-label="Etiket"
            placeholder="Etiket (ör. Matematik)"
            className="min-w-0 flex-1 bg-transparent text-center text-[0.875rem] text-[var(--fg)] outline-none placeholder:text-[var(--muted)]"
          />
        </label>
        {tags.length > 0 ? (
          <div
            className="mt-2.5 flex flex-wrap justify-center gap-1.5"
            role="group"
            aria-label="Son kullanılan etiketler"
          >
            {tags.map((t) => {
              const on = t.toLocaleLowerCase("tr") === tag.trim().toLocaleLowerCase("tr");
              return (
                <button
                  key={t}
                  type="button"
                  aria-pressed={on}
                  onClick={() => onTag(on ? "" : t)}
                  className={
                    "h-7 max-w-[10rem] truncate rounded-full border px-3 text-xs font-medium transition-colors " +
                    (on
                      ? "border-transparent bg-[var(--accent-soft)] text-[var(--accent)]"
                      : "border-[var(--line-strong)] text-[var(--muted)] hover:bg-[var(--hover)] hover:text-[var(--fg)]")
                  }
                >
                  {t}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      <Controls sw={sw} />

      <div className="mt-5 flex min-h-8 items-center justify-center gap-2 text-[0.8125rem] text-[var(--muted)]">
        {sw.status === "paused" ? (
          confirming ? (
            <>
              <span>Kaydedilmeden silinsin mi?</span>
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
                onClick={sw.discard}
                className="btn btn-warn btn-sm"
              >
                Sil
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="link-btn"
            >
              Kaydetmeden sil
            </button>
          )
        ) : sw.status === "running" ? (
          wake.supported ? (
            <span>
              {wake.held
                ? "Ekran açık kalıyor"
                : "Ekranın açık kalması için sayfayı açık tut"}
            </span>
          ) : (
            <span className="text-[var(--warn)]">
              Bu tarayıcı ekranı açık tutamıyor. Telefonun ekran zaman aşımını
              uzat.
            </span>
          )
        ) : null}
      </div>
    </section>
  );
}
