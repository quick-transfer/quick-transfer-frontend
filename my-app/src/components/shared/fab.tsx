import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FabProps {
  label?: string;
  onClick?: () => void;
  className?: string;
}

export function Fab({
  label = "Novo",
  onClick,
  className,
}: FabProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        onClick={onClick}
        className={cn(
          "fixed bottom-6 right-6 z-30 inline-flex size-14 items-center justify-center rounded-full shadow-lg hover:shadow-xl transition-all",
          "bg-primary text-primary-foreground hover:bg-primary-700",
          className
        )}
        aria-label={label}
      >
        <Plus className="size-6" />
      </TooltipTrigger>
      <TooltipContent side="left">{label}</TooltipContent>
    </Tooltip>
  );
}
