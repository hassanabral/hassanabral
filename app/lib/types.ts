// Core domain types for the TrackIt demo.
// These mirror the structure a real backend would persist, so the demo's
// data model doubles as the product's foundation.

export type TrackerCategory = "hotel" | "product" | "electronics" | "generic";

export type DataStrategy = "api" | "scrape";

export interface Source {
  /** Human label, e.g. "Grailed" */
  name: string;
  /** Domain, e.g. "grailed.com" */
  domain: string;
  /** How we'd actually pull data in production */
  strategy: DataStrategy;
  /** Short note on the strategy shown in the UI */
  note: string;
}

/** A single understood condition that must be true to notify the user. */
export interface Condition {
  label: string; // "Price"
  operator: string; // "under", "equals", "in"
  value: string; // "$3,000"
}

/** The structured result of interpreting a natural-language request. */
export interface ParsedTracker {
  title: string;
  category: TrackerCategory;
  /** The thing being watched, e.g. "Zegna Triple Stitch shoes" */
  target: string;
  /** Extracted attributes (size, color, location, condition...) */
  attributes: { label: string; value: string }[];
  conditions: Condition[];
  sources: Source[];
  /** How often we'd re-check, in minutes */
  checkIntervalMin: number;
  /** Confidence 0-1 of the interpretation */
  confidence: number;
  /** Anything the parser wasn't sure about — surfaced for confirmation */
  clarifications: string[];
}

export type TrackerStatus = "watching" | "match" | "checking" | "paused";

export interface TrackerEvent {
  at: string; // relative label e.g. "2m ago"
  text: string;
  kind: "info" | "match" | "check";
}

/** A live (mocked) tracker on the dashboard. */
export interface Tracker extends ParsedTracker {
  id: string;
  status: TrackerStatus;
  createdAt: string;
  lastChecked: string;
  checksRun: number;
  events: TrackerEvent[];
  /** Populated when status === "match" */
  match?: {
    headline: string;
    detail: string;
    price?: string;
    url: string;
    source: string;
  };
}
