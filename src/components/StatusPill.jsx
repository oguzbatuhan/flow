import { useI18n } from "../i18n.jsx";

// Small status chip: dot + "Ready / Running / Paused"
export default function StatusPill({ status }) {
  const { t } = useI18n();
  const dot =
    status === "running"
      ? "bg-[var(--accent)] shadow-[0_0_0_3px_var(--accent-soft)]"
      : status === "paused"
        ? "bg-[var(--warn)]"
        : "bg-[var(--line-strong)]";
  return (
    <p className="inline-flex h-7 items-center gap-2 rounded-full bg-[var(--surface-2)] px-3 text-xs font-medium text-[var(--muted)]">
      <span className={"h-1.5 w-1.5 rounded-full " + dot} aria-hidden="true"></span>
      <span role="status">{t("status." + status)}</span>
    </p>
  );
}
