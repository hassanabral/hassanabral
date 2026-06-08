import type { Tracker } from "./types";
import { parseRequest } from "./parser";

// Pre-seeded trackers shown on the dashboard so the demo feels "lived in."
// One is in a "match" state to showcase the notification flow.

function build(
  raw: string,
  overrides: Partial<Tracker>
): Tracker {
  const parsed = parseRequest(raw);
  return {
    ...parsed,
    id: Math.random().toString(36).slice(2, 9),
    status: "watching",
    createdAt: "Jun 6",
    lastChecked: "just now",
    checksRun: 0,
    events: [],
    ...overrides,
  };
}

export const SEED_TRACKERS: Tracker[] = [
  build("Notify me if the LG G6 TV goes on sale new, used, or open box for under $3,000 in 77\".", {
    id: "trk_lg77",
    status: "match",
    createdAt: "Jun 2",
    lastChecked: "4m ago",
    checksRun: 312,
    match: {
      headline: "Open-box LG G6 77\" found for $2,749",
      detail: "eBay · seller 99.4% positive · ships free · listed 11 min ago",
      price: "$2,749",
      url: "https://www.ebay.com/itm/lg-g6-77-oled",
      source: "eBay",
    },
    events: [
      { at: "4m ago", text: "Match found on eBay — $2,749 (open box). Email sent.", kind: "match" },
      { at: "34m ago", text: "Checked 3 sources — no match under $3,000", kind: "check" },
      { at: "1h ago", text: "Best Buy price changed: $3,499 → $3,299 (still above cap)", kind: "info" },
    ],
  }),
  build("Notify me when there are open rooms to book at the Post Hotel in Seattle.", {
    id: "trk_post",
    status: "watching",
    createdAt: "Jun 4",
    lastChecked: "11m ago",
    checksRun: 188,
    events: [
      { at: "11m ago", text: "Checked availability — fully booked through Jun 30", kind: "check" },
      { at: "2h ago", text: "1 room briefly appeared then sold out before notify window", kind: "info" },
    ],
  }),
  build("Tell me when the Zegna Dearskin Triple Stitch shoes in size 8 are for sale on Grailed.", {
    id: "trk_zegna",
    status: "checking",
    createdAt: "Jun 5",
    lastChecked: "checking…",
    checksRun: 96,
    events: [
      { at: "now", text: "Scanning Grailed saved-search feed…", kind: "check" },
      { at: "20m ago", text: "2 new listings — both size 9, skipped", kind: "info" },
    ],
  }),
];
