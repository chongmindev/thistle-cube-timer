import { useEffect, useMemo, useState } from "react";
import { formatMs, formatSolve } from "../lib/format";
import { averageText } from "../lib/shareCard";
import { effective, rolling, type Solve } from "../lib/stats";

/** One rolling average from the times list, shared as plain text: its times and scrambles. */
export function AverageDetail({
  solves,
  end,
  size,
  eventName,
  decimals,
  onClose,
}: {
  solves: Solve[];
  /** Index of the last solve in the average. */
  end: number;
  size: number;
  eventName: string;
  decimals: number;
  onClose: () => void;
}) {
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const label = `ao${size}`;
  const first = end - size + 1;

  const average = useMemo(
    () => formatMs(rolling(solves.slice(0, end + 1), size)[end], decimals),
    [solves, end, size, decimals],
  );

  const text = useMemo(() => {
    const window = solves.slice(first, end + 1);
    // Same trim as the average itself: the best and worst 5%, at least one each.
    const trim = Math.ceil(size * 0.05);
    const order = window
      .map((s, i) => ({ i, t: effective(s) }))
      .sort((a, b) => a.t - b.t);
    const dropped = new Set(
      [...order.slice(0, trim), ...order.slice(size - trim)].map((o) => o.i),
    );
    return averageText({
      event: eventName,
      label,
      average,
      solves: window.map((s, i) => ({
        time: formatSolve(s, decimals),
        scramble: s.scramble,
        dropped: dropped.has(i),
      })),
    });
  }, [solves, first, end, size, eventName, label, average, decimals]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setStatus("Copied. Paste it anywhere.");
    } catch {
      setStatus("Clipboard is blocked in this browser.");
    }
    window.setTimeout(() => setStatus(null), 1800);
  };

  if (first < 0 || end >= solves.length) return null;

  return (
    <>
      <div className="sheet-scrim" onClick={onClose} />
      <aside
        className="sheet"
        aria-label={`${label} ending at solve ${end + 1}`}
      >
        <header className="sheet-head">
          <p className="sheet-meta">
            {label}, solves {first + 1} to {end + 1}, {eventName}
          </p>
          <button className="text-button" onClick={onClose}>
            Close
          </button>
        </header>
        <p className="sheet-time">{average}</p>

        <section className="sheet-section share">
          <pre className="share-text">{text}</pre>
          <div className="share-actions">
            <button className="text-button" onClick={copy}>
              Copy text
            </button>
          </div>
          {status && (
            <p className="share-status" role="status">
              {status}
            </p>
          )}
        </section>
      </aside>
    </>
  );
}
