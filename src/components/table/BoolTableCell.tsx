import { useState, useEffect, useRef } from "react"
import { TableCell } from "@/components/ui/table"

interface BoolTableCellProps {
  value: boolean
}

export function BoolTableCell({ value: initialValue }: BoolTableCellProps) {
  const [value, setValue] = useState(initialValue)
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)
  const cellRef = useRef<HTMLTableCellElement>(null)

  const handleEdit = () => {
    setIsEditing(true)
    setEditValue(value)
  }

  const handleSave = () => {
    setValue(editValue)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditValue(value)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      handleCancel()
    } else if (e.key === ' ') {
      e.preventDefault()
      setEditValue(!editValue)
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
        <div className="flex items-center justify-center">
          <input
            type="checkbox"
            checked={editValue}
            onChange={(e) => setEditValue(e.target.checked)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            autoFocus
          />
        </div>
      ) : (
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
      )}
    </TableCell>
  )
}