import { TableCell } from "@/components/ui/table"

interface TextTableCellProps {
  value: string
}

export function TextTableCell({ value }: TextTableCellProps) {
  return (
    <TableCell>
      <div className="max-w-[200px] truncate" title={value}>
        {value}
      </div>
    </TableCell>
  )
}

