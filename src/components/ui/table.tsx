import * as React from "react"

import { cn } from "@/lib/utils"

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto"
    >
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("[&_tr]:border-b", className)}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "bg-muted/50 border-t font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors",
        className
      )}
      {...props}
    />
  )
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    />
  )
}

function TableCell({ className, children, ...props }: React.ComponentProps<"td">) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const currentCell = e.currentTarget.closest('td') as HTMLTableCellElement
    if (!currentCell) return

    const row = currentCell.closest('tr') as HTMLTableRowElement
    const table = currentCell.closest('table') as HTMLTableElement
    if (!row || !table) return

    const cells = Array.from(row.cells)
    const rows = Array.from(table.querySelectorAll('tbody tr'))
    
    const currentColIndex = cells.indexOf(currentCell)
    const currentRowIndex = rows.indexOf(row)

    let targetCell: HTMLTableCellElement | null = null

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault()
        if (currentRowIndex > 0) {
          const targetRow = rows[currentRowIndex - 1]
          targetCell = targetRow.cells[currentColIndex]
        }
        break
      case 'ArrowDown':
        e.preventDefault()
        if (currentRowIndex < rows.length - 1) {
          const targetRow = rows[currentRowIndex + 1]
          targetCell = targetRow.cells[currentColIndex]
        }
        break
      case 'ArrowLeft':
        e.preventDefault()
        if (currentColIndex > 0) {
          targetCell = cells[currentColIndex - 1]
        }
        break
      case 'ArrowRight':
        // Tab or ArrowRight - go right
        if (currentColIndex < cells.length - 1) {
          targetCell = cells[currentColIndex + 1]
        }
        break
    }

    if (targetCell) {
      const overlay = targetCell.querySelector('[tabindex="0"]') as HTMLElement
      if (overlay) {
        overlay.focus()
      }
    }
  }

  return (
    <td
      data-slot="table-cell"
      className={cn(
        "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] relative",
        className
      )}
      {...props}
    >
      {children}
      {/* Focusable overlay */}
      <div
        className="absolute inset-0 border-2 border-transparent focus:border-blue-500 focus:outline-none z-10"
        tabIndex={0}
        onKeyDown={handleKeyDown}
      />
    </td>
  )
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("text-muted-foreground mt-4 text-sm", className)}
      {...props}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
