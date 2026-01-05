import { TableCell } from "@/components/ui/table";

interface TextTableCellProps extends React.ComponentProps<typeof TableCell> {
  value: string;
}

export function TextTableCell({ value, ...cellProps }: TextTableCellProps) {
  return (
    <TableCell {...cellProps}>
      <div className="max-w-[200px] truncate" title={value}>
        {value}
      </div>
    </TableCell>
  );
}
