import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BoolTableCell } from "./BoolTableCell";
import { TextTableCell } from "./TextTableCell";
import { NumberTableCell } from "./NumberTableCell";
import { PopperTableCell } from "./PopperTableCell";
import type { ColumnDefinition, TableData } from "./types";

interface DataTableProps {
  columns: ColumnDefinition[];
  data: TableData[];
}

export function DataTable({ columns, data }: DataTableProps) {
  const [rows, setRows] = useState<TableData[]>(data);
  const [selectedCell, setSelectedCell] = useState<{
    row: number;
    col: number;
  } | null>({
    row: 0,
    col: 0,
  });
  const [editingCell, setEditingCell] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [uneditableTooltipCell, setUneditableTooltipCell] = useState<
    string | null
  >(null);
  const popperFocusFnsRef = useRef(new Map<string, () => void>());
  const tooltipTimerRef = useRef<number | null>(null);

  const rowCount = rows.length;
  const colCount = columns.length;
  const tableRef = useRef<HTMLTableElement | null>(null);

  useEffect(() => {
    setRows(data);
  }, [data]);

  const selectedKey = useMemo(() => {
    if (!selectedCell) return null;
    return `${selectedCell.row}:${selectedCell.col}`;
  }, [selectedCell]);

  const editingKey = useMemo(() => {
    if (!editingCell) return null;
    return `${editingCell.row}:${editingCell.col}`;
  }, [editingCell]);

  const getCellElement = (row: number, col: number) =>
    tableRef.current?.querySelector<HTMLTableCellElement>(
      `td[data-row="${row}"][data-col="${col}"]`,
    ) ?? null;

  useEffect(() => {
    if (!selectedCell) return;
    getCellElement(selectedCell.row, selectedCell.col)?.focus();
  }, [selectedCell]);

  useEffect(() => {
    if (!editingCell) return;

    const cell = getCellElement(editingCell.row, editingCell.col);
    const editor = cell?.querySelector<HTMLInputElement>(
      "[data-cell-editor='true']",
    );
    if (!editor) return;

    requestAnimationFrame(() => {
      editor.focus();
      editor.select();
    });
  }, [editingCell]);

  useEffect(() => {
    if (editingCell || !selectedCell) return;

    requestAnimationFrame(() => {
      getCellElement(selectedCell.row, selectedCell.col)?.focus();
    });
  }, [editingCell, selectedCell]);

  useEffect(() => {
    return () => {
      if (tooltipTimerRef.current) {
        window.clearTimeout(tooltipTimerRef.current);
      }
    };
  }, []);

  const moveCell = (
    deltaRow: number,
    deltaCol: number,
    wrap: boolean = false,
  ) => {
    if (!selectedCell) return;

    let nextRow = selectedCell.row + deltaRow;
    let nextCol = selectedCell.col + deltaCol;

    if (wrap && nextCol >= colCount) {
      nextCol = 0;
      nextRow += 1;
    } else if (wrap && nextCol < 0) {
      nextCol = colCount - 1;
      nextRow -= 1;
    }

    nextRow = Math.max(0, Math.min(rowCount - 1, nextRow));
    nextCol = Math.max(0, Math.min(colCount - 1, nextCol));
    setSelectedCell({ row: nextRow, col: nextCol });
    setEditingCell(null);
  };

  const showUneditableTooltip = (row: number, col: number) => {
    const key = `${row}:${col}`;
    setUneditableTooltipCell(key);
    if (tooltipTimerRef.current) {
      window.clearTimeout(tooltipTimerRef.current);
    }
    tooltipTimerRef.current = window.setTimeout(() => {
      setUneditableTooltipCell(null);
    }, 1200);
  };

  const handleCellKeyDown = (
    event: React.KeyboardEvent<HTMLTableCellElement>,
    row: number,
    col: number,
  ) => {
    const key = event.key;
    const target = event.target as HTMLElement | null;
    const isPopperCell = columns[col]?.type === "popper";
    const isIdCell = columns[col]?.key === "id";
    const isEditing = editingCell?.row === row && editingCell?.col === col;
    const isTextInput =
      target?.matches("input, textarea, [contenteditable=true]") ?? false;

    const isBoolCell = columns[col]?.type === "boolean";

    if (key === "Enter") {
      if (target?.closest("[data-popper-trigger]")) {
        return;
      }

      event.preventDefault();
      if (isTextInput || (isEditing && isBoolCell)) {
        if (isTextInput && columns[col]?.type === "number") {
          const inputValue = (target as HTMLInputElement).value;
          updateCellValue(
            row,
            columns[col].key,
            parseAndFormatNumberInput(inputValue, columns[col].format),
          );
        }
        setEditingCell(null);
        return;
      }

      if (!isEditing) {
        if (isIdCell) {
          setSelectedCell({ row, col });
          setEditingCell(null);
          showUneditableTooltip(row, col);
          return;
        }
        setSelectedCell({ row, col });
        setEditingCell({ row, col });
        return;
      }

      if (isPopperCell) {
        const focusFn = popperFocusFnsRef.current.get(`${row}:${col}`);
        focusFn?.();
      }
      return;
    }

    if (key === "Escape") {
      event.preventDefault();
      if (isEditing) {
        setEditingCell(null);
      } else {
        setSelectedCell(null);
      }
      return;
    }

    if (isEditing && isBoolCell) {
      if (
        key === "ArrowUp" ||
        key === "ArrowDown" ||
        key === "ArrowLeft" ||
        key === "ArrowRight"
      ) {
        event.preventDefault();
        const currentValue = columns[col].accessor
          ? columns[col].accessor!(rows[row])
          : rows[row][columns[col].key];
        updateCellValue(row, columns[col].key, !currentValue);
        return;
      }
      if (key === "Tab") {
        event.preventDefault();
        moveCell(0, event.shiftKey ? -1 : 1, true);
      }
      return;
    }

    if (isTextInput) {
      if (key === "Tab") {
        event.preventDefault();
        moveCell(0, event.shiftKey ? -1 : 1, true);
      }
      return;
    }

    if (key === "Tab") {
      event.preventDefault();
      moveCell(0, event.shiftKey ? -1 : 1, true);
      return;
    }

    if (key === "ArrowUp") {
      event.preventDefault();
      moveCell(-1, 0);
      return;
    }
    if (key === "ArrowDown") {
      event.preventDefault();
      moveCell(1, 0);
      return;
    }
    if (key === "ArrowLeft") {
      event.preventDefault();
      moveCell(0, -1);
      return;
    }
    if (key === "ArrowRight") {
      event.preventDefault();
      moveCell(0, 1);
    }
  };

  const registerPopperFocusTrigger = (
    row: number,
    col: number,
    focusFn: (() => void) | null,
  ) => {
    const key = `${row}:${col}`;
    if (focusFn) {
      popperFocusFnsRef.current.set(key, focusFn);
    } else {
      popperFocusFnsRef.current.delete(key);
    }
  };

  const renderCell = (column: ColumnDefinition, row: TableData) => {
    const value = column.accessor ? column.accessor(row) : row[column.key];

    switch (column.type) {
      case "boolean":
        return <BoolTableCell value={value as boolean} />;
      case "text":
        return <TextTableCell value={value as string} />;
      case "number":
        return (
          <NumberTableCell value={value as number} format={column.format} />
        );
      default:
        return String(value);
    }
  };

  const updateCellValue = (
    rowIndex: number,
    columnKey: string,
    value: unknown,
  ) => {
    setRows((prev) =>
      prev.map((row, index) =>
        index === rowIndex
          ? {
              ...row,
              [columnKey]: value,
            }
          : row,
      ),
    );
  };

  const roundToTwoDecimals = (value: number) => Math.round(value * 100) / 100;

  const parseAndFormatNumberInput = (
    rawValue: string,
    format?: "currency" | "percentage" | "decimal",
  ) => {
    const parsed = Number(rawValue);
    if (!Number.isFinite(parsed)) {
      return 0;
    }
    if (
      format === "currency" ||
      format === "percentage" ||
      format === "decimal"
    ) {
      return roundToTwoDecimals(parsed);
    }
    return roundToTwoDecimals(parsed);
  };

  return (
    <Table ref={tableRef}>
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHead key={column.key}>{column.header}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row, rowIndex) => (
          <TableRow key={rowIndex}>
            {columns.map((column, colIndex) => {
              const cellKey = `${rowIndex}:${colIndex}`;
              const isSelected = selectedKey === cellKey;
              const isEditing = editingKey === cellKey;
              const isIdCell = column.key === "id";
              const value = column.accessor
                ? column.accessor(row)
                : row[column.key];

              return (
                <TableCell
                  key={column.key}
                  className="relative"
                  data-row={rowIndex}
                  data-col={colIndex}
                  data-cell-state={
                    isEditing ? "editing" : isSelected ? "selected" : "idle"
                  }
                  tabIndex={isSelected ? 0 : -1}
                  onClick={() => {
                    if (isSelected) {
                      if (isIdCell) {
                        setEditingCell(null);
                        showUneditableTooltip(rowIndex, colIndex);
                        return;
                      }
                      setEditingCell({ row: rowIndex, col: colIndex });
                    } else {
                      setSelectedCell({ row: rowIndex, col: colIndex });
                      setEditingCell(null);
                    }
                  }}
                  onDoubleClick={() => {
                    if (column.type === "boolean") {
                      updateCellValue(rowIndex, column.key, !Boolean(value));
                      setSelectedCell({ row: rowIndex, col: colIndex });
                      setEditingCell({ row: rowIndex, col: colIndex });
                    }
                  }}
                  onKeyDown={(event) =>
                    handleCellKeyDown(event, rowIndex, colIndex)
                  }
                >
                  <div className="cell-content w-full min-w-0">
                    {column.type === "popper" ? (
                      <PopperTableCell
                        value={value as string}
                        triggerText={column.triggerText}
                        isEditing={isEditing}
                        onChange={(nextValue) =>
                          updateCellValue(rowIndex, column.key, nextValue)
                        }
                        onRegisterFocusTrigger={(focusFn) =>
                          registerPopperFocusTrigger(
                            rowIndex,
                            colIndex,
                            focusFn,
                          )
                        }
                      />
                    ) : isEditing && column.type === "text" ? (
                      <input
                        data-cell-editor="true"
                        autoFocus
                        size={1}
                        value={String(value ?? "")}
                        onChange={(event) =>
                          updateCellValue(
                            rowIndex,
                            column.key,
                            event.target.value,
                          )
                        }
                        className="box-border w-full min-w-0 max-w-[200px] bg-transparent pl-2 py-1 text-sm outline-none focus-visible:outline-none"
                      />
                    ) : isEditing && column.type === "number" ? (
                      <input
                        data-cell-editor="true"
                        autoFocus
                        type="number"
                        step={
                          column.format === "currency" ||
                          column.format === "percentage"
                            ? "0.01"
                            : "any"
                        }
                        defaultValue={
                          Number.isFinite(Number(value))
                            ? Number(value).toFixed(2)
                            : "0.00"
                        }
                        onBlur={(event) =>
                          updateCellValue(
                            rowIndex,
                            column.key,
                            parseAndFormatNumberInput(
                              event.target.value,
                              column.format,
                            ),
                          )
                        }
                        className="cell-number-editor box-border w-full min-w-0 max-w-full bg-transparent py-1 text-left text-sm font-mono outline-none focus-visible:outline-none"
                      />
                    ) : (
                      renderCell(column, row)
                    )}
                  </div>
                  {uneditableTooltipCell === cellKey ? (
                    <div className="pointer-events-none absolute -top-1 left-1/2 z-100 -translate-x-1/2 -translate-y-full rounded-md bg-foreground px-2 py-1 text-xs text-background shadow">
                      Cell uneditable
                    </div>
                  ) : null}
                </TableCell>
              );
            })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
