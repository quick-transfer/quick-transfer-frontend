import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";

type SearchInputProps = Omit<ComponentProps<"input">, "type"> & {
  wrapperClassName?: string;
};

export function SearchInput({
  className,
  wrapperClassName,
  placeholder = "Buscar...",
  ...props
}: SearchInputProps) {
  return (
    <div className={cn("relative", wrapperClassName)}>
      <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
      <Input
        type="search"
        placeholder={placeholder}
        className={cn("pl-9", className)}
        {...props}
      />
    </div>
  );
}
