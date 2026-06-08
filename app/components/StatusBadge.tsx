import type { TrackerStatus } from "../lib/types";

const MAP: Record<TrackerStatus, { label: string; cls: string; dot: string }> = {
  watching: { label: "Watching", cls: "text-brand-soft bg-brand/10 border-brand/30", dot: "bg-brand-soft" },
  match: { label: "Match found", cls: "text-mint bg-mint/10 border-mint/30", dot: "bg-mint" },
  checking: { label: "Checking…", cls: "text-amber bg-amber/10 border-amber/30", dot: "bg-amber animate-pulse-soft" },
  paused: { label: "Paused", cls: "text-gray-400 bg-white/5 border-line", dot: "bg-gray-500" },
};

export default function StatusBadge({ status }: { status: TrackerStatus }) {
  const s = MAP[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${s.cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}
