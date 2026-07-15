import { cn } from "../../lib/utils";

export const Skeleton = ({ className }) => (
  <div className={cn("skeleton rounded-md", className)} />
);

export const BoardCardSkeleton = () => (
  <div className="card space-y-3 rounded-3xl p-5">
    <Skeleton className="h-3 w-2/3" />
    <Skeleton className="h-2.5 w-full" />
    <Skeleton className="h-2.5 w-4/5" />
    <div className="flex items-center justify-between pt-2">
      <Skeleton className="h-6 w-16 rounded-full" />
      <Skeleton className="h-6 w-6 rounded-full" />
    </div>
  </div>
);
