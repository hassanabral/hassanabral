"use client";

import { useState } from "react";
import Link from "next/link";
import { SEED_TRACKERS } from "../lib/mockData";
import type { Tracker } from "../lib/types";
import StatusBadge from "../components/StatusBadge";
import EmailPreview from "../components/EmailPreview";
import { Bell, Clock, Globe, ArrowRight, Pulse } from "../components/Icons";

export default function Dashboard() {
  const [openId, setOpenId] = useState<string | null>("trk_lg77");
  const trackers = SEED_TRACKERS;

  const stats = {
    active: trackers.filter((t) => t.status !== "paused").length,
    matches: trackers.filter((t) => t.status === "match").length,
    checks: trackers.reduce((a, t) => a + t.checksRun, 0),
  };

  return (
    <main className="mx-auto max-w-5xl px-4 pb-24">
      <nav className="flex items-center justify-between py-5">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-white shadow-lg shadow-brand/30">
            <Bell width={17} height={17} />
          </span>
          <span className="text-lg font-semibold tracking-tight">TrackIt</span>
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-glow"
        >
          New tracker <ArrowRight width={15} height={15} />
        </Link>
      </nav>

      <header className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Your trackers</h1>
          <p className="mt-1 text-sm text-gray-400">Everything TrackIt is watching for you right now.</p>
        </div>
        <div className="flex gap-3">
          {[
            { k: "Active", v: stats.active },
            { k: "Matches", v: stats.matches },
            { k: "Checks run", v: stats.checks.toLocaleString() },
          ].map((s) => (
            <div key={s.k} className="glass rounded-xl px-4 py-2 text-center">
              <div className="text-lg font-semibold text-white">{s.v}</div>
              <div className="text-[11px] uppercase tracking-wide text-gray-500">{s.k}</div>
            </div>
          ))}
        </div>
      </header>

      <div className="mt-6 space-y-4">
        {trackers.map((t) => (
          <TrackerCard key={t.id} t={t} open={openId === t.id} onToggle={() => setOpenId(openId === t.id ? null : t.id)} />
        ))}
      </div>
    </main>
  );
}

function TrackerCard({ t, open, onToggle }: { t: Tracker; open: boolean; onToggle: () => void }) {
  const isMatch = t.status === "match";
  return (
    <div className={`glass overflow-hidden rounded-2xl transition ${isMatch ? "ring-1 ring-mint/30" : ""}`}>
      <button onClick={onToggle} className="flex w-full items-center gap-4 p-5 text-left">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2.5">
            <StatusBadge status={t.status} />
            <span className="text-[11px] text-gray-500">created {t.createdAt}</span>
          </div>
          <h3 className="mt-2 truncate text-base font-semibold text-white">{t.title}</h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1">
              <Globe width={12} height={12} /> {t.sources.length} source{t.sources.length > 1 ? "s" : ""}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock width={12} height={12} /> every {t.checkIntervalMin}m · {t.lastChecked}
            </span>
            <span className="inline-flex items-center gap-1">
              <Pulse width={12} height={12} /> {t.checksRun.toLocaleString()} checks
            </span>
          </div>
        </div>
        {isMatch && t.match && (
          <div className="hidden shrink-0 text-right sm:block">
            <div className="text-lg font-semibold text-mint">{t.match.price}</div>
            <div className="text-[11px] text-gray-500">{t.match.source}</div>
          </div>
        )}
        <ArrowRight
          width={18}
          height={18}
          className={`shrink-0 text-gray-500 transition ${open ? "rotate-90" : ""}`}
        />
      </button>

      {open && (
        <div className="border-t border-line px-5 pb-5 pt-4">
          <div className="grid gap-5 md:grid-cols-5">
            {/* Left: conditions + activity */}
            <div className="md:col-span-3">
              <div className="text-xs font-medium uppercase tracking-wide text-gray-500">Notify when</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {t.conditions.map((c, i) => (
                  <span key={i} className="rounded-lg border border-line bg-panel2/60 px-2.5 py-1 text-xs">
                    <span className="text-gray-400">{c.label}</span> <span className="text-brand-soft">{c.operator}</span>{" "}
                    <span className="font-semibold text-white">{c.value}</span>
                  </span>
                ))}
              </div>

              <div className="mt-4 text-xs font-medium uppercase tracking-wide text-gray-500">Activity</div>
              <ul className="mt-2 space-y-2">
                {t.events.map((e, i) => (
                  <li key={i} className="flex gap-2.5 text-sm">
                    <span
                      className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                        e.kind === "match" ? "bg-mint" : e.kind === "check" ? "bg-amber" : "bg-gray-600"
                      }`}
                    />
                    <div>
                      <span className="text-gray-300">{e.text}</span>
                      <span className="ml-2 text-[11px] text-gray-600">{e.at}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right: email preview if matched */}
            <div className="md:col-span-2">
              {isMatch ? (
                <>
                  <div className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">Email we sent</div>
                  <EmailPreview tracker={t} />
                </>
              ) : (
                <div className="flex h-full min-h-[120px] flex-col items-center justify-center rounded-xl border border-dashed border-line bg-panel2/30 p-5 text-center">
                  <Clock width={20} height={20} className="text-gray-600" />
                  <p className="mt-2 text-sm text-gray-500">No match yet — still watching. You'll get an email here the second it hits.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
