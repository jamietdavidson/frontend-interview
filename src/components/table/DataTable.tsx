import React from "react"
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
import type { ColumnDefinition, TableData } from "./types"

interface DataTableProps {
  columns: ColumnDefinition[]
  data: TableData[]
}

export function DataTable({ columns, data }: DataTableProps) {
  const renderCell = (column: ColumnDefinition, row: TableData) => {
    const value = column.accessor
      ? column.accessor(row)
      : row[column.key]

    switch (column.type) {
      case "boolean":
        return <BoolTableCell value={value as boolean} />
      case "text":
        return <TextTableCell value={value as string} />
      case "number":
        return (
          <NumberTableCell
            value={value as number}
            format={column.format}
          />
        )
      case "popper":
        return (
          <PopperTableCell
            value={value as string}
            triggerText={column.triggerText}
          />
        )
      default:
        return <TableCell>{String(value)}</TableCell>
    }
  }

  return (
    <Table>
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
            {columns.map((column) => (
              <React.Fragment key={column.key}>
                {renderCell(column, row)}
              </React.Fragment>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

