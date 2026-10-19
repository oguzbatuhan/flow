const base = { fill: "none", "aria-hidden": "true" };
const stroke = { stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round" };

export function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" {...base}>
      <path d="M3.5 5h11M7 5V3.5h4V5M5 5l.7 9h6.6L13 5" strokeWidth="1.4" {...stroke} />
    </svg>
  );
}

export function ExpandIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" {...base}>
      <path d="M2.5 6.5v-4h4M11.5 2.5h4v4M15.5 11.5v4h-4M6.5 15.5h-4v-4" strokeWidth="1.4" {...stroke} />
    </svg>
  );
}

export function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 22 22" {...base}>
      <path d="M5 5l12 12M17 5L5 17" strokeWidth="1.6" {...stroke} />
    </svg>
  );
}
