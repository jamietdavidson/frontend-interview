import { TableCell } from "@/components/ui/table";

interface BoolTableCellProps extends React.ComponentProps<typeof TableCell> {
  value: boolean;
}

export function BoolTableCell({ value, ...cellProps }: BoolTableCellProps) {
  return (
    <TableCell {...cellProps}>
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
    </TableCell>
  );
}
