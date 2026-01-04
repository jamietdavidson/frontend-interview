import { useState } from "react"
import { TableCell } from "@/components/ui/table"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { useCellNavigation } from "./CellNavigationContext"
import { cn } from "@/lib/utils"

interface PopperTableCellProps {
  value: string
  triggerText?: string
  isFocused: boolean
  rowIndex: number
  colIndex: number
}

export function PopperTableCell({
  value,
  triggerText = "View",
  isFocused,
  rowIndex,
  colIndex,
}: PopperTableCellProps) {
  const [open, setOpen] = useState(false)
  const { setFocusedCell, isEditing, setIsEditing } = useCellNavigation()

  const handleCellClick = (e: React.MouseEvent) => {
    // Prevent the cell click from triggering when clicking the button
    if ((e.target as HTMLElement).closest("button")) {
      return
    }

    if (isFocused && !isEditing) {
      setIsEditing(true)
    } else if (!isFocused) {
      setFocusedCell({ rowIndex, colIndex })
    }
  }

  return (
    <TableCell
      onClick={handleCellClick}
      className={cn(
        "cursor-pointer",
        isFocused && !isEditing && "outline outline-2 outline-blue-500",
        isFocused && isEditing && "outline outline-2 outline-green-500"
      )}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">
            {triggerText}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Details</h4>
            <p className="text-sm text-muted-foreground break-words">
              {value}
            </p>
          </div>
        </PopoverContent>
      </Popover>
    </TableCell>
  )
}

