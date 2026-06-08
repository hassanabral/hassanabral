import type { Tracker } from "../lib/types";
import { Bell } from "./Icons";

// A faux email notification — what the user would actually receive.
export default function EmailPreview({ tracker }: { tracker: Tracker }) {
  const m = tracker.match;
  if (!m) return null;
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-white text-gray-900 shadow-2xl">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2.5 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <span className="grid h-6 w-6 place-items-center rounded-md bg-brand text-white">
            <Bell width={13} height={13} />
          </span>
          <span className="font-semibold text-gray-700">TrackIt</span>
          <span className="text-gray-400">&lt;alerts@trackit.app&gt;</span>
        </div>
        <span>now</span>
      </div>
      <div className="px-5 py-4">
        <p className="text-[11px] uppercase tracking-wide text-brand">Match found</p>
        <h4 className="mt-1 text-base font-semibold leading-snug text-gray-900">{m.headline}</h4>
        <p className="mt-1 text-sm text-gray-500">{m.detail}</p>

        <div className="mt-4 rounded-lg bg-gray-50 p-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Your watch</span>
            <span className="font-medium text-gray-800">{tracker.target}</span>
          </div>
          {tracker.conditions.map((c) => (
            <div key={c.label} className="mt-1 flex items-center justify-between">
              <span className="text-gray-500">{c.label}</span>
              <span className="font-medium text-gray-800">
                {c.operator} {c.value}
              </span>
            </div>
          ))}
        </div>

        <a
          href={m.url}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-glow"
        >
          View on {m.source} →
        </a>
        <p className="mt-3 text-center text-[11px] text-gray-400">
          You're getting this because you asked TrackIt to watch this for you. Manage or pause anytime.
        </p>
      </div>
    </div>
  );
}
