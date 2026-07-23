import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { VariantProps } from "class-variance-authority";
import type { badgeVariants } from "@/components/ui/badge";

interface TimelineItemProps {
  title: string;
  description?: string;
  date: string;
  badgeLabel?: string;
  badgeVariant?: VariantProps<typeof badgeVariants>["variant"];
  isLast?: boolean;
  className?: string;
}

export function TimelineItem({
  title,
  description,
  date,
  badgeLabel,
  badgeVariant = "neutral",
  isLast = false,
  className,
}: TimelineItemProps) {
  return (
    <div className={cn("relative flex gap-4 pb-6", className)}>
      {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-1.75 top-6 h-full w-px bg-border" />
      )}

      {/* Dot */}
      <div className="relative z-10 mt-1.5 size-3.5 shrink-0 rounded-full border-2 border-primary bg-card" />

      {/* Content */}
      <div className="flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-medium text-foreground">{title}</p>
          {badgeLabel && (
            <Badge variant={badgeVariant}>{badgeLabel}</Badge>
          )}
        </div>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
        <p className="text-xs text-muted-foreground">{date}</p>
      </div>
    </div>
  );
}
