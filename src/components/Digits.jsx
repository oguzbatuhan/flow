import { pad, splitMs } from "../lib/time.js";

// Counter digits. While running, only the colon slowly fades in and out.
export default function Digits({ ms, running, className = "", style }) {
  const { m, s } = splitMs(ms);
  return (
    <p
      role="timer"
      aria-live="off"
      aria-label={m + " dakika " + s + " saniye"}
      className={"digits " + className}
      style={style}
    >
      <span>{pad(m)}</span>
      <span className={"colon" + (running ? " running" : "")}>:</span>
      <span>{pad(s)}</span>
    </p>
  );
}
