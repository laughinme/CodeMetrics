"use client";

import { memo } from "react";
import { GitBranch } from "lucide-react";

import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/lib/utils";

import type { RepoBranch } from "../model/types";

type BranchRowProps = {
  branch: RepoBranch;
  className?: string;
};

function BranchRowComponent({ branch, className }: BranchRowProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-2xl border border-border/20 bg-card/60 p-4 transition hover:border-border/30 hover:bg-card/70",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
          <GitBranch className="size-4" />
        </div>
        <span className="text-base font-semibold text-foreground/90">
          {branch.name}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {branch.isDefault && (
          <Badge className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
            Default
          </Badge>
        )}
        {branch.isProtected && (
          <Badge className="rounded-full bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground/80">
            Protected
          </Badge>
        )}
      </div>
    </div>
  );
}

export const BranchRow = memo(BranchRowComponent);
