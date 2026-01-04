import { TableCell } from "@/components/ui/table"
import { useCellNavigation } from "./CellNavigationContext"
import { cn } from "@/lib/utils"

interface TextTableCellProps {
  value: string
  isFocused: boolean
  rowIndex: number
  colIndex: number
}

export function TextTableCell({
  value,
  isFocused,
  rowIndex,
  colIndex,
}: TextTableCellProps) {
  const { setFocusedCell, isEditing, setIsEditing } = useCellNavigation()

  const handleClick = () => {
    if (isFocused && !isEditing) {
      // Second click: enter edit mode
      setIsEditing(true)
    } else if (!isFocused) {
      // First click: select the cell
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
      <div className="max-w-[200px] truncate" title={value}>
        {value}
      </div>
    </TableCell>
  )
}

