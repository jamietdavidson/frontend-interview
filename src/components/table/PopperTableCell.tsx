import { useState } from "react"
import { TableCell } from "@/components/ui/table"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"

interface PopperTableCellProps {
  value: string
  triggerText?: string
}

export function PopperTableCell({
  value,
  triggerText = "View",
}: PopperTableCellProps) {
  const [open, setOpen] = useState(false)

  return (
    <TableCell>
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

