import React, { useState, useCallback, useRef, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { BoolTableCell } from "./BoolTableCell"
import { TextTableCell } from "./TextTableCell"
import { NumberTableCell } from "./NumberTableCell"
import { PopperTableCell } from "./PopperTableCell"
import { CellNavigationContext } from "./CellNavigationContext"
import type { ColumnDefinition, ColumnType, TableData, CellPosition } from "./types"

interface DataTableProps {
  columns: ColumnDefinition[]
  data: TableData[]
}

export function DataTable({ columns, data }: DataTableProps) {
  const [focusedCell, setFocusedCell] = useState<CellPosition | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const tableRef = useRef<HTMLTableElement>(null)

  // Get the type of the currently focused cell
  const focusedCellType: ColumnType | null = focusedCell
    ? columns[focusedCell.colIndex]?.type ?? null
    : null

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!focusedCell) return

      // Handle Enter to toggle edit mode (works for all cell types)
      if (e.key === "Enter" && !isEditing) {
        e.preventDefault()
        setIsEditing(true)
        return
      }

      // For popper cells in edit mode, delegate to the cell's handler
      if (focusedCellType === "popper" && isEditing) {
        const handler = (window as any).__popperCellHandler
        console.log("Popper cell in edit mode, handler:", handler, "key:", e.key)
        if (handler && handler(e.key)) {
          e.preventDefault()
          return
        }
      }

      // Handle Escape to exit edit mode
      if (e.key === "Escape" && isEditing) {
        e.preventDefault()
        setIsEditing(false)
        return
      }

      // Don't allow navigation when in edit mode
      if (isEditing) return

      const { rowIndex, colIndex } = focusedCell
      let newRow = rowIndex
      let newCol = colIndex

      switch (e.key) {
        case "ArrowUp":
          e.preventDefault()
          newRow = Math.max(0, rowIndex - 1)
          break
        case "ArrowDown":
          e.preventDefault()
          newRow = Math.min(data.length - 1, rowIndex + 1)
          break
        case "ArrowLeft":
          e.preventDefault()
          newCol = Math.max(0, colIndex - 1)
          break
        case "ArrowRight":
          e.preventDefault()
          newCol = Math.min(columns.length - 1, colIndex + 1)
          break
        case "Tab":
          e.preventDefault()
          if (e.shiftKey) {
            // Shift+Tab: move left, wrap to previous row
            if (colIndex > 0) {
              newCol = colIndex - 1
            } else if (rowIndex > 0) {
              newRow = rowIndex - 1
              newCol = columns.length - 1
            }
          } else {
            // Tab: move right, wrap to next row
            if (colIndex < columns.length - 1) {
              newCol = colIndex + 1
            } else if (rowIndex < data.length - 1) {
              newRow = rowIndex + 1
              newCol = 0
            }
          }
          break
        default:
          return
      }

      if (newRow !== rowIndex || newCol !== colIndex) {
        setFocusedCell({ rowIndex: newRow, colIndex: newCol })
      }
    },
    [focusedCell, focusedCellType, isEditing, data.length, columns.length]
  )

  // Reset edit mode when changing cells
  const handleSetFocusedCell = useCallback(
    (position: CellPosition | null) => {
      setFocusedCell(position)
      setIsEditing(false)
    },
    []
  )

  // Focus the table when a cell is focused so keyboard events work
  useEffect(() => {
    if (focusedCell && tableRef.current) {
      tableRef.current.focus()
    }
  }, [focusedCell])

  const renderCell = (
    column: ColumnDefinition,
    row: TableData,
    rowIndex: number,
    colIndex: number
  ) => {
    const value = column.accessor ? column.accessor(row) : row[column.key]
    const isFocused =
      focusedCell?.rowIndex === rowIndex && focusedCell?.colIndex === colIndex

    const cellProps = {
      isFocused,
      rowIndex,
      colIndex,
    }

    switch (column.type) {
      case "boolean":
        return <BoolTableCell value={value as boolean} {...cellProps} />
      case "text":
        return <TextTableCell value={value as string} {...cellProps} />
      case "number":
        return (
          <NumberTableCell
            value={value as number}
            format={column.format}
            {...cellProps}
          />
        )
      case "popper":
        return (
          <PopperTableCell
            value={value as string}
            triggerText={column.triggerText}
            {...cellProps}
          />
        )
      default:
        return <TableCell>{String(value)}</TableCell>
    }
  }

  return (
    <CellNavigationContext.Provider
        value={{
          focusedCell,
          setFocusedCell: handleSetFocusedCell,
          isEditing,
          setIsEditing,
          focusedCellType,
        }}
      >
      <Table
        ref={tableRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className="outline-none"
      >
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.key}>{column.header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {columns.map((column, colIndex) => (
                <React.Fragment key={column.key}>
                  {renderCell(column, row, rowIndex, colIndex)}
                </React.Fragment>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CellNavigationContext.Provider>
  )
}

