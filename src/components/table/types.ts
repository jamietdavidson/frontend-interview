export type ColumnType = "text" | "number" | "boolean" | "popper"

/** Stored value for `type: "popper"` columns */
export interface PopperColumnValue {
  details: string
  role: string
  skills: string
  department: string
  experience: string
}

/** Default nested-field values for popper cells (Role, Skills, Department, Experience) */
export const POPPER_NESTED_DEFAULTS: Pick<
  PopperColumnValue,
  "role" | "skills" | "department" | "experience"
> = {
  role: "Frontend Engineer",
  skills: "Coding",
  department: "Engineering",
  experience: "10 years",
}

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

