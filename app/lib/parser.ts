import type { ParsedTracker, Source, Condition } from "./types";

// ---------------------------------------------------------------------------
// MOCK INTENT PARSER
// ---------------------------------------------------------------------------
// In the real product this is a single LLM call with a structured-output schema
// (function calling) that turns a free-text request into a ParsedTracker, plus
// a source-resolution step that picks the right site + data strategy.
//
// For this no-backend demo we approximate that with a deterministic keyword
// parser. It is intentionally good enough to make the three flagship examples
// feel "understood," and degrades gracefully to a generic parse for anything
// else the visitor types.
// ---------------------------------------------------------------------------

const titleCase = (s: string) =>
  s.replace(/\b\w/g, (c) => c.toUpperCase()).replace(/\s+/g, " ").trim();

function detectSize(text: string): string | null {
  const m = text.match(/\bsize\s*(\d{1,2}(?:\.\d)?)\b/i) || text.match(/\bin\s+(\d{2})"\b/);
  if (m) return m[1];
  const tv = text.match(/\b(\d{2})\s*(?:inch|")\b/i);
  return tv ? tv[1] : null;
}

function detectPriceCap(text: string): string | null {
  const m = text.match(/under\s*\$?\s*([\d,]+)/i) || text.match(/below\s*\$?\s*([\d,]+)/i) || text.match(/less than\s*\$?\s*([\d,]+)/i);
  return m ? `$${m[1].replace(/,/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",")}` : null;
}

function detectConditions(text: string): string[] {
  const out: string[] = [];
  const t = text.toLowerCase();
  if (/\bnew\b/.test(t)) out.push("New");
  if (/\bused\b/.test(t)) out.push("Used");
  if (/open[\s-]?box/.test(t)) out.push("Open box");
  if (/refurb/.test(t)) out.push("Refurbished");
  return out;
}

const HOTEL_SOURCE = (name: string, domain: string): Source => ({
  name,
  domain,
  strategy: "api",
  note: "Availability API polled on a schedule",
});

const GENERIC_SCRAPE = (name: string, domain: string): Source => ({
  name,
  domain,
  strategy: "scrape",
  note: "Headless-browser scrape with anti-bot handling",
});

// --- Flagship hand-tuned parses ------------------------------------------------

function parseHotel(text: string): ParsedTracker {
  return {
    title: "Post Hotel · Seattle — room availability",
    category: "hotel",
    target: "Open / bookable rooms at The Post Hotel, Seattle",
    attributes: [
      { label: "Location", value: "Seattle, WA" },
      { label: "Property", value: "The Post Hotel" },
      { label: "Trigger", value: "Any available room" },
    ],
    conditions: [{ label: "Availability", operator: "is", value: "bookable" }],
    sources: [
      HOTEL_SOURCE("Post Hotel (direct)", "posthotel.com"),
      HOTEL_SOURCE("Booking.com", "booking.com"),
      HOTEL_SOURCE("Expedia", "expedia.com"),
    ],
    checkIntervalMin: 15,
    confidence: 0.93,
    clarifications: [
      "No dates given — I'll watch the next 90 days. Want specific check-in dates?",
      "How many guests / room type? Defaulting to any room, 2 guests.",
    ],
  };
}

function parseGrailed(text: string): ParsedTracker {
  const size = detectSize(text) ?? "8";
  return {
    title: "Zegna Triple Stitch · Grailed listing watch",
    category: "product",
    target: "Zegna Dearskin Triple Stitch shoes",
    attributes: [
      { label: "Brand", value: "Ermenegildo Zegna" },
      { label: "Model", value: "Dearskin Triple Stitch" },
      { label: "Size", value: `US ${size}` },
      { label: "Trigger", value: "New listing appears / in stock" },
    ],
    conditions: [
      { label: "Size", operator: "equals", value: `US ${size}` },
      { label: "Listing", operator: "is", value: "for sale (not sold)" },
    ],
    sources: [
      {
        name: "Grailed",
        domain: "grailed.com",
        strategy: "scrape",
        note: "Saved-search feed scraped; new matches diffed each run",
      },
    ],
    checkIntervalMin: 10,
    confidence: 0.9,
    clarifications: ["Any max price, or notify on every matching listing regardless of price?"],
  };
}

function parseTV(text: string): ParsedTracker {
  const size = detectSize(text) ?? "77";
  const cap = detectPriceCap(text) ?? "$3,000";
  const conds = detectConditions(text);
  const condValue = conds.length ? conds.join(" / ") : "New / Used / Open box";
  const conditions: Condition[] = [
    { label: "Price", operator: "under", value: cap },
    { label: "Size", operator: "equals", value: `${size}"` },
    { label: "Condition", operator: "in", value: condValue },
  ];
  return {
    title: `LG G6 OLED ${size}" — under ${cap}`,
    category: "electronics",
    target: `LG G6 OLED TV (${size}")`,
    attributes: [
      { label: "Model", value: "LG G6 OLED" },
      { label: "Size", value: `${size}"` },
      { label: "Condition", value: condValue },
      { label: "Trigger", value: `Listed at or below ${cap}` },
    ],
    conditions,
    sources: [
      { name: "Best Buy", domain: "bestbuy.com", strategy: "api", note: "Product API + price field polled" },
      GENERIC_SCRAPE("eBay (Open box)", "ebay.com"),
      GENERIC_SCRAPE("LG Outlet", "lg.com"),
    ],
    checkIntervalMin: 30,
    confidence: 0.88,
    clarifications: ["Include marketplace/3rd-party sellers, or first-party retailers only?"],
  };
}

// --- Generic fallback ----------------------------------------------------------

function parseGeneric(text: string): ParsedTracker {
  const size = detectSize(text);
  const cap = detectPriceCap(text);
  const conds = detectConditions(text);
  const target = titleCase(
    text
      .replace(/i('| a)?m? (want|like|'d like|would like)\s*to be notified (when|if|with)?/gi, "")
      .replace(/notify me (when|if)/gi, "")
      .replace(/(in stock|on sale|available|for sale|under .*$)/gi, "")
      .trim()
  ).slice(0, 60) || "Your tracked item";

  const conditions: Condition[] = [];
  if (cap) conditions.push({ label: "Price", operator: "under", value: cap });
  if (size) conditions.push({ label: "Size", operator: "equals", value: size });
  if (conds.length) conditions.push({ label: "Condition", operator: "in", value: conds.join(" / ") });
  if (conditions.length === 0) conditions.push({ label: "Availability", operator: "is", value: "in stock / available" });

  const attributes = [{ label: "What", value: target }];
  if (size) attributes.push({ label: "Size", value: size });
  if (cap) attributes.push({ label: "Max price", value: cap });

  return {
    title: target,
    category: "generic",
    target,
    attributes,
    conditions,
    sources: [GENERIC_SCRAPE("Auto-discovered sources", "web")],
    checkIntervalMin: 20,
    confidence: 0.71,
    clarifications: [
      "I couldn't pin this to a specific known site — in production I'd resolve the best source(s) for you.",
      "Confirm the details on the right look correct before activating.",
    ],
  };
}

export function parseRequest(raw: string): ParsedTracker {
  const t = raw.toLowerCase();
  const has = (...words: string[]) => words.every((w) => t.includes(w));

  if ((has("post") && (t.includes("hotel") || t.includes("seattle"))) || (t.includes("room") && t.includes("book") && t.includes("seattle"))) {
    return parseHotel(raw);
  }
  if (t.includes("zegna") || t.includes("grailed") || (t.includes("triple stitch"))) {
    return parseGrailed(raw);
  }
  if (t.includes("lg g6") || (t.includes("tv") && (t.includes("oled") || t.includes('77"') || t.includes("77 inch") || t.includes("g6")))) {
    return parseTV(raw);
  }
  return parseGeneric(raw);
}

export const EXAMPLES: string[] = [
  "Notify me when there are open rooms to book at the Post Hotel in Seattle.",
  "Tell me when the Zegna Dearskin Triple Stitch shoes in size 8 are in stock or for sale on Grailed.",
  "Notify me if the LG G6 TV goes on sale — new, used, or open box — for under $3,000 in 77\".",
];
