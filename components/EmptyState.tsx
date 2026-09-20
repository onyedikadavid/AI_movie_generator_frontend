import Link from "next/link";
import { Clapperboard } from "lucide-react";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-card border border-dashed border-ink-border py-24 text-center">
      <Clapperboard className="h-8 w-8 text-paper-faint" />
      <div>
        <p className="font-display text-xl text-paper">No projects yet</p>
        <p className="mt-1 text-sm text-paper-muted">Describe a story and this pipeline will break it into a script, cast, and shot list.</p>
      </div>
      <Link
        href="/projects/new"
        className="rounded-md bg-tally px-4 py-2 text-sm font-semibold text-ink hover:bg-tally/90 transition-colors"
      >
        Start your first project
      </Link>
    </div>
  );
}
