# TrackIt — watch anything on the web, in plain English

A clickable front-end demo of a natural-language tracking tool. You describe
what you're waiting for ("notify me when there are open rooms at the Post Hotel
in Seattle"), and TrackIt turns it into a structured tracker, picks the right
sources, and (in the real product) emails you the moment it matches.

> **Status:** front-end demo only. The natural-language interpretation is
> generated locally to showcase the flow — no real scraping, scheduling, or
> email is wired up yet.

## What's in here

| Path | What it is |
| --- | --- |
| `app/page.tsx` | Landing page + natural-language input with a parse-reveal flow |
| `app/dashboard/page.tsx` | Dashboard of (mocked) live trackers, including a "match found" + email preview |
| `app/lib/parser.ts` | The mock intent parser — stands in for an LLM structured-output call |
| `app/lib/types.ts` | Domain model (`ParsedTracker`, `Tracker`, `Source`, …) |
| `app/lib/mockData.ts` | Seeded trackers for the dashboard |
| `app/components/` | UI: `TrackerSpec`, `EmailPreview`, `StatusBadge`, icons |

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
```

Try the three example prompts on the home page, or type your own — it degrades
gracefully to a generic parse for anything it doesn't specifically recognize.

## How the real thing would work

The demo's structure mirrors the intended production architecture so it can
grow into the real app rather than being thrown away:

1. **Interpret** — one LLM call with a structured-output schema turns free text
   into a `ParsedTracker` (`app/lib/parser.ts` is the stand-in).
2. **Resolve sources** — pick the right site(s) and a data strategy per source:
   **official/unofficial APIs first**, headless-browser **scraping as a
   fallback** (surfaced in the UI as the API / Scrape tags).
3. **Schedule & check** — re-run each tracker on an interval, diff against the
   last result.
4. **Notify** — email the user with a direct link on the first match.

## Stack

Next.js (App Router) · TypeScript · Tailwind CSS.
