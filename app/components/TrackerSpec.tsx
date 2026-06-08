import type { ParsedTracker } from "../lib/types";
import { Plug, Globe, Clock, Sparkle } from "./Icons";

// Renders the structured interpretation of a request — the "we understood you"
// confirmation card that turns plain English into an editable tracker spec.
export default function TrackerSpec({ parsed }: { parsed: ParsedTracker }) {
  const conf = Math.round(parsed.confidence * 100);
  return (
    <div className="animate-fade-up glass rounded-2xl p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-brand-soft">
            <Sparkle width={15} height={15} />
            <span className="text-xs font-medium uppercase tracking-wide">Understood</span>
          </div>
          <h3 className="mt-1.5 text-lg font-semibold text-white">{parsed.title}</h3>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-xs text-gray-400">Confidence</div>
          <div className={`text-lg font-semibold ${conf >= 85 ? "text-mint" : conf >= 75 ? "text-amber" : "text-rose"}`}>
            {conf}%
          </div>
        </div>
      </div>

      {/* Attributes */}
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {parsed.attributes.map((a) => (
          <div key={a.label} className="rounded-lg border border-line bg-panel2/60 px-3 py-2">
            <div className="text-[11px] uppercase tracking-wide text-gray-500">{a.label}</div>
            <div className="mt-0.5 text-sm font-medium text-gray-100">{a.value}</div>
          </div>
        ))}
      </div>

      {/* Conditions */}
      <div className="mt-4">
        <div className="text-xs font-medium uppercase tracking-wide text-gray-500">Notify me when</div>
        <div className="mt-2 flex flex-wrap gap-2">
          {parsed.conditions.map((c, i) => (
            <span key={i} className="inline-flex items-center gap-1.5 rounded-lg border border-brand/30 bg-brand/10 px-2.5 py-1.5 text-sm">
              <span className="text-gray-300">{c.label}</span>
              <span className="text-brand-soft">{c.operator}</span>
              <span className="font-semibold text-white">{c.value}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Sources */}
      <div className="mt-4">
        <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-gray-500">
          <Globe width={13} height={13} /> Sources we'll watch
        </div>
        <div className="mt-2 space-y-1.5">
          {parsed.sources.map((s) => (
            <div key={s.domain} className="flex items-center justify-between rounded-lg border border-line bg-panel2/40 px-3 py-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-panel2 text-gray-400">
                  {s.strategy === "api" ? <Plug width={13} height={13} /> : <Globe width={13} height={13} />}
                </span>
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-gray-100">{s.name}</div>
                  <div className="truncate text-[11px] text-gray-500">{s.note}</div>
                </div>
              </div>
              <span
                className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase ${
                  s.strategy === "api" ? "bg-mint/15 text-mint" : "bg-amber/15 text-amber"
                }`}
              >
                {s.strategy === "api" ? "API" : "Scrape"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer meta */}
      <div className="mt-4 flex items-center gap-1.5 text-xs text-gray-500">
        <Clock width={13} height={13} />
        Re-checks every {parsed.checkIntervalMin} min
      </div>

      {/* Clarifications */}
      {parsed.clarifications.length > 0 && (
        <div className="mt-4 rounded-xl border border-amber/25 bg-amber/5 p-3">
          <div className="text-xs font-semibold text-amber">A couple of things to confirm</div>
          <ul className="mt-1.5 space-y-1">
            {parsed.clarifications.map((c, i) => (
              <li key={i} className="flex gap-2 text-sm text-gray-300">
                <span className="text-amber">•</span>
                {c}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
