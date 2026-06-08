import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TrackIt — watch anything, in plain English",
  description:
    "Describe what you want to track in natural language. TrackIt sets up the watch, checks on a schedule, and emails you the moment it matches.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
