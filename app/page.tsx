"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { parseRequest, EXAMPLES } from "./lib/parser";
import type { ParsedTracker } from "./lib/types";
import TrackerSpec from "./components/TrackerSpec";
import { Bell, Sparkle, ArrowRight, Mail, Check, Pulse } from "./components/Icons";

type Step = "input" | "parsing" | "result" | "done";

const PARSE_STEPS = [
  "Reading your request…",
  "Extracting item, attributes & conditions…",
  "Resolving the best sources to watch…",
  "Choosing API vs scrape per source…",
  "Setting a check schedule…",
];

export default function Home() {
  const [text, setText] = useState("");
  const [step, setStep] = useState<Step>("input");
  const [parsed, setParsed] = useState<ParsedTracker | null>(null);
  const [parseIdx, setParseIdx] = useState(0);
  const [email, setEmail] = useState("");
  const resultRef = useRef<HTMLDivElement>(null);

  function runParse(value: string) {
    const v = value.trim();
    if (!v) return;
    setText(v);
    setStep("parsing");
    setParseIdx(0);
    // Animate through the "thinking" steps, then reveal.
    let i = 0;
    const timer = setInterval(() => {
      i += 1;
      setParseIdx(i);
      if (i >= PARSE_STEPS.length) {
        clearInterval(timer);
        setParsed(parseRequest(v));
        setStep("result");
        setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
      }
    }, 480);
  }

  function reset() {
    setStep("input");
    setParsed(null);
    setText("");
    setEmail("");
  }

  return (
    <main className="mx-auto max-w-5xl px-4 pb-24">
      {/* Nav */}
      <nav className="flex items-center justify-between py-5">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-white shadow-lg shadow-brand/30">
            <Bell width={17} height={17} />
          </span>
          <span className="text-lg font-semibold tracking-tight">TrackIt</span>
          <span className="ml-1 rounded-full border border-line bg-panel px-2 py-0.5 text-[10px] uppercase tracking-wide text-gray-400">
            demo
          </span>
        </div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-panel px-3 py-1.5 text-sm text-gray-300 hover:border-brand/40 hover:text-white"
        >
          <Pulse width={15} height={15} /> Dashboard
        </Link>
      </nav>

      {/* Hero */}
      <section className="pt-10 text-center sm:pt-16">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-line bg-panel px-3 py-1 text-xs text-gray-400">
          <Sparkle width={13} height={13} className="text-brand-soft" /> Watch anything on the web — in plain English
        </div>
        <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          Just say what you want.
          <br />
          <span className="bg-gradient-to-r from-brand-soft via-brand to-mint bg-clip-text text-transparent">
            We'll watch it and email you.
          </span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-gray-400">
          No filters, no rules to configure. Describe the thing you're waiting for and TrackIt sets up the watch,
          checks it on a schedule, and pings you the moment it matches.
        </p>
      </section>

      {/* Input card */}
      <section className="mx-auto mt-8 max-w-2xl">
        <div className="glow-ring glass rounded-2xl p-2 transition">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) runParse(text);
            }}
            placeholder="e.g. Notify me when there are open rooms at the Post Hotel in Seattle…"
            rows={3}
            className="w-full resize-none bg-transparent px-4 py-3 text-[15px] text-gray-100 placeholder:text-gray-500 focus:outline-none"
          />
          <div className="flex items-center justify-between gap-3 px-2 pb-1">
            <span className="hidden text-xs text-gray-500 sm:block">⌘/Ctrl + Enter to run</span>
            <button
              onClick={() => runParse(text)}
              disabled={!text.trim() || step === "parsing"}
              className="ml-auto inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand/30 transition hover:bg-brand-glow disabled:cursor-not-allowed disabled:opacity-40"
            >
              {step === "parsing" ? "Setting up…" : "Set up my tracker"} <ArrowRight width={16} height={16} />
            </button>
          </div>
        </div>

        {/* Example chips */}
        {step === "input" && (
          <div className="mt-4">
            <div className="mb-2 text-center text-xs uppercase tracking-wide text-gray-500">Try an example</div>
            <div className="flex flex-col gap-2">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  onClick={() => runParse(ex)}
                  className="group flex items-center gap-3 rounded-xl border border-line bg-panel/60 px-4 py-3 text-left text-sm text-gray-300 transition hover:border-brand/40 hover:bg-panel2"
                >
                  <span className="text-brand-soft">“</span>
                  <span className="flex-1">{ex}</span>
                  <ArrowRight
                    width={15}
                    height={15}
                    className="text-gray-600 transition group-hover:translate-x-0.5 group-hover:text-brand-soft"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Parsing animation */}
      {step === "parsing" && (
        <section className="mx-auto mt-8 max-w-2xl">
          <div className="glass rounded-2xl p-5">
            <ul className="space-y-2.5">
              {PARSE_STEPS.map((s, i) => {
                const done = i < parseIdx;
                const active = i === parseIdx;
                return (
                  <li key={s} className="flex items-center gap-3 text-sm">
                    <span
                      className={`grid h-5 w-5 place-items-center rounded-full border ${
                        done
                          ? "border-mint/40 bg-mint/15 text-mint"
                          : active
                          ? "border-brand/50 bg-brand/15 text-brand-soft animate-pulse-soft"
                          : "border-line text-gray-600"
                      }`}
                    >
                      {done ? <Check width={12} height={12} /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
                    </span>
                    <span className={done ? "text-gray-400" : active ? "text-gray-100" : "text-gray-600"}>{s}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      )}

      {/* Result */}
      {step === "result" && parsed && (
        <section ref={resultRef} className="mx-auto mt-10 grid max-w-4xl gap-5 md:grid-cols-5">
          <div className="md:col-span-3">
            <TrackerSpec parsed={parsed} />
          </div>
          <div className="md:col-span-2">
            <div className="glass animate-fade-up rounded-2xl p-5">
              <div className="flex items-center gap-2 text-brand-soft">
                <Mail width={15} height={15} />
                <span className="text-xs font-medium uppercase tracking-wide">Where to notify you</span>
              </div>
              <p className="mt-2 text-sm text-gray-400">
                We'll email you the instant this matches — with a direct link to grab it.
              </p>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="glow-ring mt-3 w-full rounded-xl border border-line bg-panel2/60 px-3.5 py-2.5 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none"
              />
              <button
                onClick={() => setStep("done")}
                disabled={!email.includes("@")}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand/30 transition hover:bg-brand-glow disabled:cursor-not-allowed disabled:opacity-40"
              >
                Activate tracker <ArrowRight width={16} height={16} />
              </button>
              <button onClick={reset} className="mt-2 w-full rounded-xl px-4 py-2 text-sm text-gray-500 hover:text-gray-300">
                Start over
              </button>

              <div className="mt-4 rounded-xl border border-line bg-panel2/40 p-3 text-xs text-gray-500">
                <span className="text-gray-400">Heads up:</span> this is a front-end demo — no real scraping or email is
                wired up yet. The interpretation above is generated locally to show the flow.
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Done */}
      {step === "done" && parsed && (
        <section className="mx-auto mt-12 max-w-lg text-center">
          <div className="glass animate-fade-up rounded-2xl p-8">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-mint/15 text-mint">
              <Check width={28} height={28} />
            </div>
            <h3 className="mt-4 text-xl font-semibold text-white">You're all set.</h3>
            <p className="mt-2 text-sm text-gray-400">
              TrackIt is now watching <span className="text-gray-200">{parsed.target}</span> and will email{" "}
              <span className="text-gray-200">{email}</span> the moment it matches. First check runs in a few minutes.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand/30 hover:bg-brand-glow"
              >
                <Pulse width={16} height={16} /> View dashboard
              </Link>
              <button
                onClick={reset}
                className="inline-flex items-center gap-2 rounded-xl border border-line bg-panel px-4 py-2.5 text-sm text-gray-300 hover:text-white"
              >
                Track something else
              </button>
            </div>
          </div>
        </section>
      )}

      {/* How it works */}
      {step === "input" && (
        <section className="mx-auto mt-20 max-w-4xl">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { t: "1 · Describe it", d: "Type what you're waiting for in plain English. No rule builders." },
              { t: "2 · We resolve sources", d: "TrackIt picks the right sites and uses official APIs first, scraping only as a fallback." },
              { t: "3 · You get an email", d: "We re-check on a schedule and notify you the instant it matches — with a link." },
            ].map((c) => (
              <div key={c.t} className="glass rounded-2xl p-5">
                <div className="text-sm font-semibold text-brand-soft">{c.t}</div>
                <p className="mt-1.5 text-sm text-gray-400">{c.d}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
