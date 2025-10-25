"use client";

import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/lib/utils";

type BranchRowSkeletonProps = {
  className?: string;
};

export function BranchRowSkeleton({ className }: BranchRowSkeletonProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-2xl border border-border/15 bg-card/50 p-4",
        className
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Skeleton className="size-9 rounded-full" />
          <Skeleton className="h-5 w-32 rounded-md" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <div className="flex flex-col items-end gap-2">
          <Skeleton className="h-3 w-24 rounded-md" />
          <Skeleton className="h-3 w-20 rounded-md" />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-2/3 rounded-md" />
        <Skeleton className="h-3 w-1/2 rounded-md" />
        <Skeleton className="h-3 w-20 rounded-md" />
      </div>
    </div>
  );
}
