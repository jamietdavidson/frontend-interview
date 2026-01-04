export type ColumnType = "text" | "number" | "boolean" | "popper"

export interface ColumnDefinition<T = any> {
  key: string
  header: string
  type: ColumnType
  format?: "currency" | "percentage" | "decimal"
  triggerText?: string
  accessor?: (row: T) => any
}

export interface TableData {
  [key: string]: any
}

export interface CellPosition {
  rowIndex: number
  colIndex: number
}

export interface CellNavigationContextValue {
  focusedCell: CellPosition | null
  setFocusedCell: (position: CellPosition | null) => void
  isEditing: boolean
  setIsEditing: (editing: boolean) => void
}

