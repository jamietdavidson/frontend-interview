import { TableCell } from "@/components/ui/table"
import { useCellNavigation } from "./CellNavigationContext"
import { cn } from "@/lib/utils"

interface NumberTableCellProps {
  value: number
  format?: "currency" | "percentage" | "decimal"
  isFocused: boolean
  rowIndex: number
  colIndex: number
}

export function NumberTableCell({
  value,
  format,
  isFocused,
  rowIndex,
  colIndex,
}: NumberTableCellProps) {
  const { setFocusedCell } = useCellNavigation()

  const formatValue = () => {
    switch (format) {
      case "currency":
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(value)
      case "percentage":
        // Assume value is 0-100, just add % sign
        return `${value.toFixed(2)}%`
      case "decimal":
        return value.toFixed(2)
      default:
        return value.toLocaleString()
    }
  }

  const handleClick = () => {
    setFocusedCell({ rowIndex, colIndex })
  }

  return (
    <TableCell
      onClick={handleClick}
      className={cn(
        "cursor-pointer",
        isFocused && "outline outline-2 outline-blue-500"
      )}
    >
      <div className="text-right font-mono">{formatValue()}</div>
    </TableCell>
  )
}

