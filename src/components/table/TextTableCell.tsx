import { useState, useEffect, useRef } from "react"
import { TableCell } from "@/components/ui/table"

interface TextTableCellProps {
  value: string
}

export function TextTableCell({ value: initialValue }: TextTableCellProps) {
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
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          className="w-full bg-transparent focus:outline-none px-1"
          autoFocus
        />
      ) : (
        <div className="max-w-[200px] truncate" title={value}>
          {value}
        </div>
      )}
    </TableCell>
  )
}

