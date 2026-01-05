import { TableCell } from "@/components/ui/table";

interface NumberTableCellProps extends React.ComponentProps<typeof TableCell> {
  value: number;
  format?: "currency" | "percentage" | "decimal";
}

export function NumberTableCell({
  value,
  format,
  ...cellProps
}: NumberTableCellProps) {
  const formatValue = () => {
    switch (format) {
      case "currency":
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(value);
      case "percentage":
        // Assume value is 0-100, just add % sign
        return `${value.toFixed(2)}%`;
      case "decimal":
        return value.toFixed(2);
      default:
        return value.toLocaleString();
    }
  };

  return (
    <TableCell {...cellProps}>
      <div className="text-right font-mono">{formatValue()}</div>
    </TableCell>
  );
}
