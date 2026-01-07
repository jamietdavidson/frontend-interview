import { useState, useEffect, useRef } from "react"
import { TableCell } from "@/components/ui/table"

interface NumberTableCellProps {
  value: number
  format?: "currency" | "percentage" | "decimal"
}

export function NumberTableCell({ value: initialValue, format }: NumberTableCellProps) {
  const [value, setValue] = useState(initialValue)
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value.toString())
  const cellRef = useRef<HTMLTableCellElement>(null)

  const formatValue = (num: number) => {
    switch (format) {
      case "currency":
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(num)
      case "percentage":
        // Assume value is 0-100, just add % sign
        return `${num.toFixed(2)}%`
      case "decimal":
        return num.toFixed(2)
      default:
        return num.toLocaleString()
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
    setEditValue(value.toString())
  }

  const handleSave = () => {
    const newValue = parseFloat(editValue)
    if (!isNaN(newValue)) {
      setValue(newValue)
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditValue(value.toString())
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      handleCancel()
    }
  }

  // Focus the overlay when exiting edit mode
  useEffect(() => {
    if (!isEditing && cellRef.current) {
      const overlay = cellRef.current.querySelector('.cell-overlay') as HTMLElement
      if (overlay) {
        setTimeout(() => overlay.focus(), 0)
      }
    }
  }, [isEditing])

  return (
    <TableCell 
      ref={cellRef}
      onEdit={handleEdit} 
      data-editing={isEditing}
      className={isEditing ? "border-2 border-orange-500" : ""}
    >
      {isEditing ? (
        <input
          type="number"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          className="w-full bg-transparent focus:outline-none px-1 text-right font-mono"
          autoFocus
        />
      ) : (
        <div className="text-right font-mono">{formatValue(value)}</div>
      )}
    </TableCell>
  )
}

