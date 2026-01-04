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
  const { setFocusedCell } = useCellNavigation()

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
      <div className="max-w-[200px] truncate" title={value}>
        {value}
      </div>
    </TableCell>
  )
}

