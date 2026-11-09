import { useI18n } from "../i18n.jsx";

// Start / Pause / Resume / Finish; the same buttons on the card and in the big view
export default function Controls({ sw, size = "normal" }) {
  const { t } = useI18n();
  const lg = size === "big" ? " btn-lg" : "";

  if (sw.status === "idle") {
    return (
      <div className="flex justify-center">
        <button type="button" onClick={sw.start} className={"btn btn-solid" + lg}>
          {t("timer.start")}
        </button>
      </div>
    );
  }

  const running = sw.status === "running";
  return (
    <div className="flex justify-center gap-2">
      <button type="button" onClick={running ? sw.pause : sw.resume} className={"btn btn-solid" + lg}>
        {running ? t("timer.pause") : t("timer.resume")}
      </button>
      <button type="button" onClick={sw.finish} className={"btn btn-ghost" + lg}>
        {t("timer.finish")}
      </button>
    </div>
  );
}
