import { useEffect, useRef, useState } from "react";
import Controls from "./Controls.jsx";
import Digits from "./Digits.jsx";
import { ExpandIcon } from "./Icons.jsx";

const CONFIRM_MS = 5000;

const STATUS_TEXT = {
  idle: "Hazır",
  running: "Çalışıyor",
  paused: "Duraklatıldı",
};

export default function TimerCard({ sw, wake, onBig }) {
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
        className="my-7"
        style={{ fontSize: "clamp(3rem, 15vw, 4rem)" }}
      />

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
