import { useState, useRef, useEffect } from "react"
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

// Popper cell states:
// 1. Not focused: no outline
// 2. Focused (selected): blue outline
// 3. Editing (buttonHighlighted=false): green outline, button normal
// 4. Editing (buttonHighlighted=true): green outline, button has focus ring
// 5. Popover open: green outline, button has focus ring, popover visible

export function PopperTableCell({
  value,
  triggerText = "View",
  isFocused,
  rowIndex,
  colIndex,
}: PopperTableCellProps) {
  const [open, setOpen] = useState(false)
  const [buttonHighlighted, setButtonHighlighted] = useState(false)
  const { setFocusedCell, isEditing, setIsEditing } = useCellNavigation()
  const popoverContentRef = useRef<HTMLDivElement>(null)

  // Close popover when cell loses focus or exits edit mode
  const actualOpen = open && isFocused && isEditing

  const handleCellClick = (e: React.MouseEvent) => {
    // If clicking the button directly
    if ((e.target as HTMLElement).closest("button")) {
      if (!isFocused) {
        setFocusedCell({ rowIndex, colIndex })
      } else if (!isEditing) {
        setIsEditing(true)
      } else if (!buttonHighlighted) {
        setButtonHighlighted(true)
      } else {
        // Button is highlighted, click opens popover
        setOpen(true)
      }
      return
    }

    // Clicking the cell (not button)
    if (isFocused && !isEditing) {
      setIsEditing(true)
    } else if (!isFocused) {
      setFocusedCell({ rowIndex, colIndex })
    }
  }

  // When popover opens, focus the content
  useEffect(() => {
    if (actualOpen && popoverContentRef.current) {
      popoverContentRef.current.focus()
    }
  }, [actualOpen])

  // Reset state when cell loses focus or exits edit mode
  useEffect(() => {
    if (!isFocused || !isEditing) {
      setButtonHighlighted(false)
      if (open) setOpen(false)
    }
  }, [isFocused, isEditing, open])

  // Handle popover close
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
  }

  // Handle keyboard on popover content
  const handlePopoverKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault()
      e.stopPropagation()
      setOpen(false)
    }
  }

  // Store state in refs so the handler always has fresh values
  const buttonHighlightedRef = useRef(buttonHighlighted)
  const actualOpenRef = useRef(actualOpen)
  buttonHighlightedRef.current = buttonHighlighted
  actualOpenRef.current = actualOpen

  // Attach handler to window for DataTable to find
  useEffect(() => {
    if (isFocused && isEditing) {
      // Handler that reads from refs to avoid stale closure
      const handler = (key: string): boolean => {
        console.log("Handler called with key:", key, "buttonHighlighted:", buttonHighlightedRef.current, "actualOpen:", actualOpenRef.current)

        if (key === "Enter") {
          if (!buttonHighlightedRef.current) {
            setButtonHighlighted(true)
            return true
          } else if (!actualOpenRef.current) {
            setOpen(true)
            return true
          }
        }

        if (key === "Escape") {
          if (actualOpenRef.current) {
            setOpen(false)
            return true
          } else if (buttonHighlightedRef.current) {
            setButtonHighlighted(false)
            return true
          } else {
            setIsEditing(false)
            return true
          }
        }

        return false
      }

      ;(window as any).__popperCellHandler = handler
    }
    return () => {
      delete (window as any).__popperCellHandler
    }
  }, [isFocused, isEditing, setIsEditing])

  return (
    <TableCell
      onClick={handleCellClick}
      className={cn(
        "cursor-pointer",
        isFocused && !isEditing && "outline outline-2 outline-blue-500",
        isFocused && isEditing && "outline outline-2 outline-green-500"
      )}
    >
      <Popover open={actualOpen} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            tabIndex={-1}
            className={cn(
              buttonHighlighted &&
                "ring-2 ring-ring ring-offset-2 ring-offset-background"
            )}
          >
            {triggerText}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" onKeyDown={handlePopoverKeyDown}>
          <div
            ref={popoverContentRef}
            tabIndex={-1}
            className="space-y-2 outline-none"
          >
            <h4 className="font-medium leading-none">Details</h4>
            <p className="text-sm text-muted-foreground break-words">{value}</p>
          </div>
        </PopoverContent>
      </Popover>
    </TableCell>
  )
}
