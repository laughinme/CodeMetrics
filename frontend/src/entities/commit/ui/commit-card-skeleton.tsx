"use client";

import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/lib/utils";

type CommitCardSkeletonProps = {
  className?: string;
};

export function CommitCardSkeleton({ className }: CommitCardSkeletonProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-3xl border border-border/20 bg-card/50 p-5",
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-1 items-start gap-4">
          <Skeleton className="size-10 rounded-full" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-5 w-2/3 rounded-md" />
            <Skeleton className="h-4 w-full rounded-md" />
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Skeleton className="h-4 w-24 rounded-md" />
          <Skeleton className="h-3 w-20 rounded-md" />
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Skeleton className="size-9 rounded-full" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-28 rounded-md" />
            <Skeleton className="h-3 w-24 rounded-md" />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </div>
    </div>
  );
}
