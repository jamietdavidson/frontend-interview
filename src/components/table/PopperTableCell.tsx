import { TableCell } from "@/components/ui/table"
import FocusableCell from "@/components/table/FocusableCell";
import ButtonPopover from "@/components/ButtonPopover";

export interface PopperTableCellProps {
  value: string
  triggerText?: string
}

export function PopperTableCell({
  value,
  triggerText = "View",
}: PopperTableCellProps) {

  const FocusableButtonPopover = FocusableCell(ButtonPopover)

  return (
    <TableCell>
      <FocusableButtonPopover value={value} triggerText={triggerText} />
    </TableCell>
  )
}

