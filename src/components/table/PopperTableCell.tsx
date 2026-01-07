import { useState, useEffect, useRef } from "react"
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
  const [isEditing, setIsEditing] = useState(false)
  const [editTriggeredByEnter, setEditTriggeredByEnter] = useState(false)
  const cellRef = useRef<HTMLTableCellElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const handleEdit = (triggeredByEnter: boolean = false) => {
    setIsEditing(true)
    setEditTriggeredByEnter(triggeredByEnter)
  }

  const handleExitEdit = () => {
    setIsEditing(false)
    setEditTriggeredByEnter(false)
  }

  // Focus management when entering edit mode
  useEffect(() => {
    if (isEditing && editTriggeredByEnter && buttonRef.current) {
      // If triggered by Enter, focus the button
      setTimeout(() => buttonRef.current?.focus(), 0)
    }
  }, [isEditing, editTriggeredByEnter])

  // Focus the overlay when exiting edit mode
  useEffect(() => {
    if (!isEditing && cellRef.current) {
      const overlay = cellRef.current.querySelector('.cell-overlay') as HTMLElement
      if (overlay) {
        setTimeout(() => overlay.focus(), 0)
      }
    }
  }, [isEditing])

  // Handle click outside to exit edit mode
  useEffect(() => {
    if (!isEditing) return

    const handleClickOutside = (event: MouseEvent) => {
      if (cellRef.current && !cellRef.current.contains(event.target as Node)) {
        // Don't exit if popover is open (user might be interacting with it)
        if (!open) {
          handleExitEdit()
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isEditing, open])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      handleExitEdit()
    }
  }

  return (
    <TableCell 
      ref={cellRef}
      onEdit={(triggeredByEnter) => handleEdit(triggeredByEnter)} 
      data-editing={isEditing}
      className={isEditing ? "border-2 border-orange-500" : ""}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button 
            ref={buttonRef}
            variant="outline" 
            size="sm" 
            tabIndex={isEditing ? 0 : -1}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              // Exit edit mode when button loses focus (unless popover is opening)
              if (!open) {
                setTimeout(() => {
                  if (document.activeElement !== buttonRef.current) {
                    handleExitEdit()
                  }
                }, 0)
              }
            }}
          >
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

