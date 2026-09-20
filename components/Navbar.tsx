"use client";

import Link from "next/link";
import { Clapperboard } from "lucide-react";
import { BackendStatusPill } from "./BackendStatusPill";

export function Navbar() {
  return (
    <header className="border-b border-ink-border bg-ink/95 backdrop-blur sticky top-0 z-10">
      <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 text-paper">
          <Clapperboard className="h-5 w-5 text-tally" strokeWidth={2} />
          <span className="font-display text-lg tracking-tight">Reel Room</span>
        </Link>
        <div className="flex items-center gap-4">
          <BackendStatusPill />
          <Link
            href="/projects/new"
            className="rounded-md bg-tally px-3.5 py-1.5 text-sm font-semibold text-ink hover:bg-tally/90 transition-colors"
          >
            New project
          </Link>
        </div>
      </div>
    </header>
  );
}
