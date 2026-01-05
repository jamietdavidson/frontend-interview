import React, {
  useEffect,
  useState,
  useCallback,
  type MouseEvent,
} from "react";
import * as KeyCode from "keycode-js";

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

interface TableCellWrapperProps {
  column: ColumnDefinition;
  row: TableData;
  cellId: string;
  isSelected: boolean;
  isEditing: boolean;
  isFocusingButton: boolean;
  onUpdate: (cellId: string, newValue: string | number | boolean) => void;
}

const TableCellWrapper = React.memo(function TableCellWrapper({
  column,
  row,
  cellId,
  isSelected,
  isEditing,
  isFocusingButton,
  onUpdate,
}: TableCellWrapperProps) {
  const [editValue, setEditValue] = React.useState("");
  const value = column.accessor ? column.accessor(row) : row[column.key];
  const state = isSelected ? "selected" : "default";

  React.useEffect(() => {
    if (isEditing) {
      setEditValue(String(value));
    }
  }, [isEditing, value]);

  const handleSave = () => {
    let newValue: string | number | boolean = editValue;

    if (column.type === "number") {
      newValue = parseFloat(editValue) || 0;
    } else if (column.type === "boolean") {
      newValue = editValue.toLowerCase() === "true";
    }

    onUpdate(cellId, newValue);
  };

  if (isEditing && column.type !== "popper") {
    return (
      <TableCell state={state} data-id={cellId}>
        {column.type === "boolean" ? (
          <select
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => {
              if (e.key === KeyCode.VALUE_ENTER) {
                e.preventDefault();
                e.stopPropagation();
                handleSave();
              } else if (e.key === KeyCode.VALUE_ESCAPE) {
                e.preventDefault();
                e.stopPropagation();
                setEditValue(String(value));
                onUpdate(cellId, value);
              } else if (e.key === KeyCode.VALUE_TAB) {
                handleSave();
              } else if (
                e.key === KeyCode.VALUE_UP ||
                e.key === KeyCode.VALUE_DOWN
              ) {
                e.stopPropagation();
              }
            }}
            className="w-full px-1 py-0 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            autoFocus
          >
            <option value="true">True</option>
            <option value="false">False</option>
          </select>
        ) : (
          <input
            type={column.type === "number" ? "number" : "text"}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => {
              if (e.key === KeyCode.VALUE_ENTER) {
                e.preventDefault();
                e.stopPropagation();
                handleSave();
              } else if (e.key === KeyCode.VALUE_ESCAPE) {
                e.preventDefault();
                e.stopPropagation();
                setEditValue(String(value));
                onUpdate(cellId, value);
              } else if (e.key === KeyCode.VALUE_TAB) {
                handleSave();
              } else if (
                (e.key === KeyCode.VALUE_UP || e.key === KeyCode.VALUE_DOWN) &&
                column.type === "number"
              ) {
                e.stopPropagation();
              }
            }}
            className="w-full px-1 py-0 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        )}
      </TableCell>
    );
  }
  switch (column.type) {
    case "boolean":
      return (
        <BoolTableCell
          state={state}
          data-id={cellId}
          value={value as boolean}
        />
      );
    case "text":
      return (
        <TextTableCell state={state} data-id={cellId} value={value as string} />
      );
    case "number":
      return (
        <NumberTableCell
          state={state}
          data-id={cellId}
          value={value as number}
          format={column.format}
        />
      );
    case "popper":
      return (
        <PopperTableCell
          state={state}
          data-id={cellId}
          value={value as string}
          triggerText={column.triggerText}
          shouldFocusButton={isFocusingButton}
          isSelected={isSelected}
          onUpdate={(newValue) => onUpdate(cellId, newValue)}
        />
      );
    default:
      return (
        <TableCell state={state} data-id={cellId}>
          {String(value)}
        </TableCell>
      );
  }
});

const getCellParameters = (cellId: string | null) => {
  if (cellId === null) {
    return cellId;
  }
  const [column, row] = cellId.split(":");
  return { column: Number(column), row: Number(row) };
};

const setCellParamaters = ({ column, row }: { column: number; row: number }) =>
  `${column}:${row}`;

export function DataTable({ columns, data: initialData }: DataTableProps) {
  const [tableSelected, setTableSelected] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [focusedButtonId, setFocusedButtonId] = useState<string | null>(null);
  const [data, setData] = useState(initialData);

  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      const activeCell = getCellParameters(currentId);
      if (activeCell) {
        switch (event.key) {
          case KeyCode.VALUE_TAB: {
            if (editingId) {
              return;
            }

            const isShiftTab = event.shiftKey;
            const totalCells = columns.length * data.length;
            const currentIndex =
              activeCell.row * columns.length + activeCell.column;

            const nextIndex = isShiftTab ? currentIndex - 1 : currentIndex + 1;

            if (nextIndex >= 0 && nextIndex < totalCells) {
              event.preventDefault();
              event.stopPropagation();

              activeCell.row = Math.floor(nextIndex / columns.length);
              activeCell.column = nextIndex % columns.length;
              setCurrentId(setCellParamaters(activeCell));
            }
            return;
          }
          case KeyCode.VALUE_LEFT:
            event.preventDefault();
            activeCell.column = Math.max(0, activeCell.column - 1);
            break;
          case KeyCode.VALUE_RIGHT:
            event.preventDefault();
            activeCell.column = Math.min(
              columns.length - 1,
              activeCell.column + 1
            );
            break;
          case KeyCode.VALUE_UP:
            event.preventDefault();
            activeCell.row = Math.max(0, activeCell.row - 1);
            break;
          case KeyCode.VALUE_DOWN:
            event.preventDefault();
            activeCell.row = Math.min(data.length - 1, activeCell.row + 1);
            break;
          case KeyCode.VALUE_ENTER:
            event.preventDefault();
            if (editingId === currentId) {
              setEditingId(null);
            } else {
              const column = columns[activeCell.column];
              if (column.type === "popper") {
                setFocusedButtonId(currentId);
              } else {
                if (focusedButtonId) {
                  setFocusedButtonId(null);
                }
                setEditingId(currentId);
              }
            }
            return;
          case KeyCode.VALUE_ESCAPE:
            if (editingId) {
              event.preventDefault();
              setEditingId(null);
            } else if (focusedButtonId) {
              event.preventDefault();
              setFocusedButtonId(null);
            }
            return;
          default:
            return;
        }
        setCurrentId(setCellParamaters(activeCell));
        if (focusedButtonId) {
          setFocusedButtonId(null);
        }
      }
    };

    if (tableSelected) {
      window.addEventListener("keydown", listener);
    }

    return () => {
      window.removeEventListener("keydown", listener);
    };
  }, [
    tableSelected,
    currentId,
    columns,
    data.length,
    editingId,
    focusedButtonId,
  ]);

  const handleCellUpdate = useCallback(
    (cellId: string, newValue: string | number | boolean) => {
      const cellParams = getCellParameters(cellId);
      if (cellParams) {
        const updatedData = [...data];
        const column = columns[cellParams.column];
        updatedData[cellParams.row][column.key] = newValue;
        setData(updatedData);
        setEditingId(null);
      }
    },
    [data, columns]
  );

  const handleTableClick = useCallback((event: MouseEvent<HTMLElement>) => {
    setTableSelected(true);

    let id = (event.target as HTMLElement)?.getAttribute("data-id");
    if (!id && event.target) {
      let parent = (event.target as HTMLElement).parentElement;

      while (!id && parent !== document.body) {
        const possibleId = parent?.getAttribute("data-id");
        if (possibleId) {
          id = possibleId;
        } else {
          parent = parent?.parentElement || null;
        }
      }
    }
    setCurrentId(id);
  }, []);

  return (
    <Table onClick={handleTableClick}>
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHead key={column.key}>{column.header}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row, rowIndex) => (
          <TableRow key={rowIndex}>
            {columns.map((column, columnIndex) => {
              const cellId = setCellParamaters({
                column: columnIndex,
                row: rowIndex,
              });
              return (
                <TableCellWrapper
                  key={column.key}
                  column={column}
                  row={row}
                  cellId={cellId}
                  isSelected={currentId === cellId}
                  isEditing={editingId === cellId}
                  isFocusingButton={focusedButtonId === cellId}
                  onUpdate={handleCellUpdate}
                />
              );
            })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
