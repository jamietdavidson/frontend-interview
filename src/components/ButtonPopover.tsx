import { useState, type Ref } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { type PopperTableCellProps } from "@/components/table/PopperTableCell";

interface ButtonPopoverProps extends PopperTableCellProps {
  ref?: Ref<HTMLButtonElement>
}

export default function ButtonPopover({ triggerText, value, ref }: ButtonPopoverProps) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button ref={ref} variant="outline" size="sm" tabIndex={-1}>
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
  )
}
