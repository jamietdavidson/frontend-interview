import { createContext, useContext } from "react"
import type { CellNavigationContextValue } from "./types"

export const CellNavigationContext = createContext<CellNavigationContextValue | null>(null)

export function useCellNavigation() {
  const context = useContext(CellNavigationContext)
  if (!context) {
    throw new Error("useCellNavigation must be used within a CellNavigationProvider")
  }
  return context
}
