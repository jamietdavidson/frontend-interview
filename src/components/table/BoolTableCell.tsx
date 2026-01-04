import { TableCell } from "@/components/ui/table"
import { useCellNavigation } from "./CellNavigationContext"
import { cn } from "@/lib/utils"

interface BoolTableCellProps {
  value: boolean
  isFocused: boolean
  rowIndex: number
  colIndex: number
}

export function BoolTableCell({
  value,
  isFocused,
  rowIndex,
  colIndex,
}: BoolTableCellProps) {
  const { setFocusedCell, isEditing, setIsEditing } = useCellNavigation()

  const handleClick = () => {
    if (isFocused && !isEditing) {
      setIsEditing(true)
    } else if (!isFocused) {
      setFocusedCell({ rowIndex, colIndex })
    }
  }

  return (
    <TableCell
      onClick={handleClick}
      className={cn(
        "cursor-pointer",
        isFocused && !isEditing && "outline outline-2 outline-blue-500",
        isFocused && isEditing && "outline outline-2 outline-green-500"
      )}
    >
      <div className="flex items-center justify-center">
        <span
          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
            value
              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
              : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
          }`}
        >
          {value ? "✓ True" : "✗ False"}
        </span>
      </div>
    </TableCell>
  )
}

