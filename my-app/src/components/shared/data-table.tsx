"use client";

import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "./empty-state";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ──

/**
 * Column descriptor for DataTable.
 *
 * `key` doubles as the sort key — it must match the property name on T for
 * sorting to work. If `render` is provided the raw value is still used for
 * sorting; rendering and sorting are independent.
 */
export interface DataTableColumn<T> {
  key: string;
  header: string;
  sortable?: boolean;
  className?: string;
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  pageSize?: number;
  searchable?: boolean;
  searchPlaceholder?: string;
  // Explicit key list rather than searching all fields — avoids accidentally
  // matching internal IDs or numeric codes that are meaningless to the user.
  searchKeys?: string[];
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
  // Preferred over the row index for React reconciliation; use a stable domain ID.
  getRowKey?: (row: T) => string;
}

type SortDirection = "asc" | "desc" | null;

// ── Component ──

/**
 * Generic, client-side sortable/paginated/searchable data table.
 *
 * All filtering, sorting, and pagination are done in-memory. Not suitable for
 * datasets where the server must paginate (i.e. > a few hundred rows).
 */
export function DataTable<T extends object>({
  columns,
  data,
  pageSize = 10,
  searchable = false,
  searchPlaceholder = "Buscar...",
  searchKeys = [],
  emptyTitle = "Nenhum resultado encontrado",
  emptyDescription,
  className,
  getRowKey,
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDirection>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // useMemo for filter and sort prevents re-running O(n) operations on every
  // keystroke that doesn't change the relevant inputs.

  const filteredData = useMemo(() => {
    if (!searchQuery.trim() || searchKeys.length === 0) return data;
    const query = searchQuery.toLowerCase();
    return data.filter((row) =>
      searchKeys.some((key) => {
        const val = (row as Record<string, unknown>)[key];
        return val != null && String(val).toLowerCase().includes(query);
      })
    );
  }, [data, searchQuery, searchKeys]);

  const sortedData = useMemo(() => {
    if (!sortKey || !sortDir) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[sortKey];
      const bVal = (b as Record<string, unknown>)[sortKey];
      // Nulls always sort last regardless of direction.
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      // localeCompare with numeric:true handles "10" > "9" correctly without
      // needing to know whether the column contains numbers or strings.
      const cmp = String(aVal).localeCompare(String(bVal), "pt-BR", {
        numeric: true,
      });
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filteredData, sortKey, sortDir]);

  // Math.max(1, …) prevents totalPages from being 0 when data is empty,
  // which would break the safePage clamp below.
  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  // safePage re-clamps currentPage after a filter removes rows and the current
  // page no longer exists — avoids showing an empty page.
  const safePage = Math.min(currentPage, totalPages);
  const paginatedData = sortedData.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  // Sort cycle: unsorted → asc → desc → unsorted.
  // Resetting to page 1 on sort prevents viewing an empty last page after
  // sort order changes reduce the visible row count.
  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDir === "asc") setSortDir("desc");
      else if (sortDir === "desc") {
        setSortKey(null);
        setSortDir(null);
      }
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setCurrentPage(1);
  };

  const getSortIcon = (key: string) => {
    if (sortKey !== key) return <ArrowUpDown className="size-3.5" />;
    if (sortDir === "asc") return <ArrowUp className="size-3.5" />;
    return <ArrowDown className="size-3.5" />;
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search */}
      {searchable && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              // Reset to page 1 so filtered results always start from the beginning.
              setCurrentPage(1);
            }}
            className="pl-9"
          />
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg shadow-primary-900 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-primary-900 hover:bg-primary-900">
              {columns.map((col) => (
                <TableHead
                  className={cn("text-xs font-semibold tracking-wider text-white px-6", col.className)}
                  key={col.key}
                >
                  {col.sortable ? (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5"
                      onClick={() => handleSort(col.key)}
                      aria-label={`Ordenar por ${col.header}`}
                    >
                      {col.header}
                      {getSortIcon(col.key)}
                    </button>
                  ) : (
                    col.header
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-48">
                  <EmptyState
                    title={emptyTitle}
                    description={emptyDescription}
                  />
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, rowIndex) => (
                <TableRow
                  // Fall back to row index only when getRowKey isn't provided —
                  // index keys break React reconciliation on reorder/filter.
                  key={getRowKey ? getRowKey(row) : rowIndex}
                  className="hover:bg-muted/30 transition-colors"
                >
                  {columns.map((col) => (
                    <TableCell key={col.key} className={col.className}>
                      {col.render
                        ? col.render(row)
                        : ((row as Record<string, unknown>)[col.key] as React.ReactNode) ?? "—"
                        }
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination — hidden when all data fits on one page */}
      {sortedData.length > pageSize && (
        <div className="flex items-center justify-between px-1">
          <p className="text-sm text-muted-foreground">
            Mostrando{" "}
            <span className="font-medium text-foreground">
              {(safePage - 1) * pageSize + 1}
            </span>{" "}
            a{" "}
            <span className="font-medium text-foreground">
              {Math.min(safePage * pageSize, sortedData.length)}
            </span>{" "}
            de{" "}
            <span className="font-medium text-foreground">
              {sortedData.length}
            </span>{" "}
            resultados
          </p>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => setCurrentPage(1)}
              disabled={safePage === 1}
              aria-label="Primeira página"
            >
              <ChevronsLeft className="size-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              aria-label="Página anterior"
            >
              <ChevronLeft className="size-3.5" />
            </Button>

            {/* Page numbers — windowed to ±1 around current page plus always
                showing first and last, with ellipsis for gaps. This keeps the
                control compact even with 50+ pages. */}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((page) => {
                if (totalPages <= 5) return true;
                if (page === 1 || page === totalPages) return true;
                return Math.abs(page - safePage) <= 1;
              })
              .map((page, idx, arr) => {
                const showEllipsis = idx > 0 && page - arr[idx - 1] > 1;
                return (
                  <span key={page} className="flex items-center">
                    {showEllipsis && (
                      <span className="px-1 text-sm text-muted-foreground">
                        …
                      </span>
                    )}
                    <Button
                      variant={safePage === page ? "default" : "outline"}
                      size="icon-sm"
                      onClick={() => setCurrentPage(page)}
                      aria-label={`Página ${page}`}
                      aria-current={safePage === page ? "page" : undefined}
                    >
                      {page}
                    </Button>
                  </span>
                );
              })}

            <Button
              variant="outline"
              size="icon-sm"
              onClick={() =>
                setCurrentPage((p) => Math.min(totalPages, p + 1))
              }
              disabled={safePage === totalPages}
              aria-label="Próxima página"
            >
              <ChevronRight className="size-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => setCurrentPage(totalPages)}
              disabled={safePage === totalPages}
              aria-label="Última página"
            >
              <ChevronsRight className="size-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
