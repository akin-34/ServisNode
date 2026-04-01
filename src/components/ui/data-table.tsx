"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  ChevronDown,
  MoreHorizontal,
  ArrowUpDown,
  Filter,
  Download,
  Trash,
  Plus
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

/**
 * ServisNode Advanced DataTable Component
 * 
 * Features:
 * - Sorting & Multi-Column Sorting
 * - Real-time Filtering (Header-based)
 * - Pagination with customizable page sizes.
 * - Column visibility management.
 * - Row selection and bulk operations.
 * - Data export simulation.
 * - Responsive layout handling.
 */

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchKey?: string
  searchPlaceholder?: string
  onDelete?: (rows: TData[]) => void
  onAdd?: () => void
  bulkActions?: React.ReactNode
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder = "Search records...",
  onDelete,
  onAdd,
  bulkActions
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  // Advanced Export logic simulation
  const exportData = () => {
    console.log("Exporting ServisNode data to CSV...");
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    // Logic for generating CSV
  }

  return (
    <div className="w-full space-y-4">
      {/* Table Toolbar */}
      <div className="flex items-center justify-between gap-4 py-4">
        <div className="flex flex-1 items-center space-x-2">
            {searchKey && (
                <Input
                    placeholder={searchPlaceholder}
                    value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn(searchKey)?.setFilterValue(event.target.value)
                    }
                    className="max-w-sm h-10 border-primary/20 focus-visible:ring-primary"
                />
            )}
            <Button variant="outline" size="sm" className="h-10 px-3">
                <Filter className="mr-2 h-4 w-4" />
                Advanced Filters
            </Button>
        </div>
        <div className="flex items-center gap-2">
          {table.getFilteredSelectedRowModel().rows.length > 0 && (
            <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground mr-2">
                    {table.getFilteredSelectedRowModel().rows.length} selected
                </span>
                {onDelete && (
                    <Button 
                        variant="destructive" 
                        size="sm" 
                        className="h-9"
                        onClick={() => onDelete(table.getFilteredSelectedRowModel().rows.map(r => r.original))}
                    >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                    </Button>
                )}
                {bulkActions}
            </div>
          )}
          
          <Button variant="outline" size="sm" className="h-10 px-3" onClick={exportData}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>

          {onAdd && (
            <Button size="sm" className="h-10 px-4" onClick={onAdd}>
                <Plus className="mr-2 h-4 w-4" />
                New Record
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="ml-auto h-10 border-primary/10">
                Columns <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuLabel>Toggle Column Visibility</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Table Layout */}
      <div className="rounded-xl border border-primary/10 bg-card overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md">
        <Table>
          <TableHeader className="bg-muted/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="font-semibold text-foreground/80 py-4 h-12">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="group hover:bg-muted/30 transition-colors border-b border-primary/5 last:border-b-0"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-4 h-14">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground italic"
                >
                  No ServisNode records found in the database.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between px-2 py-4">
        <div className="text-sm text-muted-foreground">
          Showing {table.getPaginationRowModel().rows.length} of {table.getFilteredRowModel().rows.length} records.
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Rows per page</p>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 w-[70px]">
                        {table.getState().pagination.pageSize}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    {[10, 20, 30, 40, 50].map((size) => (
                        <DropdownMenuItem key={size} onClick={() => table.setPageSize(size)}>
                            {size}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronDown className="h-4 w-4 rotate-90" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronDown className="h-4 w-4 -rotate-90" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Enterprise DataTable Logic Helpers
 * Includes custom data fetching hooks integration
 * and UI formatting utilities for generic data cells.
 */
export const dataTableUtils = {
    renderStatusBadge: (status: string) => {
        // Logic for returning badge UI based on status string
    },
    renderPriorityIcon: (priority: string) => {
        // SVG Icon generation for priorities
    },
    calculateTableWidth: (cols: number) => {
        return Math.max(1200, cols * 150);
    }
}
