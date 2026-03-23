import { useEffect, useMemo, useRef, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";

interface PopperTableCellProps {
  value: string;
  triggerText?: string;
  isEditing: boolean;
  onChange?: (value: string) => void;
  onRegisterFocusTrigger?: (focusFn: (() => void) | null) => void;
}

export function PopperTableCell({
  value,
  triggerText = "View",
  isEditing,
  onChange,
  onRegisterFocusTrigger,
}: PopperTableCellProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<HTMLTextAreaElement | null>(null);
  const nestedButtonsRef = useRef<Array<Array<HTMLButtonElement | null>>>([]);
  const nestedRows = useMemo(
    () => [
      [
        { label: "Summary", value: value.slice(0, 28) || "-" },
        { label: "Length", value: String(value.length) },
      ],
      [
        { label: "Words", value: String(value.trim().split(/\s+/).length) },
        { label: "Has ID", value: value.includes("ID:") ? "Yes" : "No" },
      ],
      [
        { label: "Upper", value: value.toUpperCase().slice(0, 18) },
        { label: "Lower", value: value.toLowerCase().slice(0, 18) },
      ],
    ],
    [value],
  );
  const resizeEditorToContent = () => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.style.height = "auto";
    editor.style.height = `${editor.scrollHeight}px`;
  };
  const focusEditorAtEnd = () => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();
    const end = editor.value.length;
    editor.setSelectionRange(end, end);
  };
  const focusNestedCell = (row: number, col: number) => {
    const maxRow = nestedRows.length - 1;
    const maxCol = nestedRows[0].length - 1;
    const nextRow = Math.max(0, Math.min(maxRow, row));
    const nextCol = Math.max(0, Math.min(maxCol, col));
    nestedButtonsRef.current[nextRow]?.[nextCol]?.focus();
  };

  useEffect(() => {
    onRegisterFocusTrigger?.(() => {
      triggerRef.current?.focus();
    });

    return () => onRegisterFocusTrigger?.(null);
  }, [onRegisterFocusTrigger]);

  useEffect(() => {
    if (!open) return;

    const handleFocusIn = (event: FocusEvent) => {
      const target = event.target as Node | null;
      if (!target) return;

      const inTrigger = !!triggerRef.current?.contains(target);
      const inContent = !!contentRef.current?.contains(target);

      if (!inTrigger && !inContent) {
        setOpen(false);
      }
    };

    document.addEventListener("focusin", handleFocusIn);
    return () => document.removeEventListener("focusin", handleFocusIn);
  }, [open]);

  useEffect(() => {
    if (!open || !isEditing) return;
    requestAnimationFrame(() => {
      resizeEditorToContent();
      focusEditorAtEnd();
    });
  }, [open, isEditing]);

  useEffect(() => {
    if (!open || !isEditing) return;
    resizeEditorToContent();
  }, [value, open, isEditing]);

  return (
    <Popover
      open={isEditing ? open : false}
      onOpenChange={(nextOpen) => {
        if (!isEditing && nextOpen) return;
        setOpen(nextOpen);
      }}
    >
      <PopoverTrigger asChild>
        <Button
          ref={triggerRef}
          variant="outline"
          size="sm"
          data-popper-trigger
          onPointerDown={(event) => {
            if (!isEditing) {
              event.preventDefault();
            }
          }}
        >
          {triggerText}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        ref={contentRef}
        className="w-80"
        onOpenAutoFocus={(event) => {
          if (!isEditing) return;
          event.preventDefault();
          requestAnimationFrame(() => {
            focusEditorAtEnd();
          });
        }}
      >
        <div className="space-y-3">
          <h4 className="font-medium leading-none">Details</h4>
          {isEditing ? (
            <textarea
              ref={editorRef}
              data-cell-editor="true"
              value={value}
              onChange={(event) => onChange?.(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.stopPropagation();
                  event.preventDefault();
                  setOpen(false);
                  return;
                }
                if (event.key === "ArrowDown" || event.key === "Tab") {
                  event.stopPropagation();
                  event.preventDefault();
                  focusNestedCell(0, 0);
                }
              }}
              rows={1}
              className="box-border w-full min-w-0 resize-none overflow-hidden bg-transparent py-1 text-sm text-muted-foreground outline-none focus-visible:outline-none"
            />
          ) : (
            <p className="text-sm text-muted-foreground break-words">{value}</p>
          )}
          <Table className="table-fixed">
            <TableBody>
              {nestedRows.map((row, rowIndex) => (
                <TableRow key={`nested-row-${rowIndex}`}>
                  {row.map((cell, colIndex) => (
                    <TableCell key={`${cell.label}-${colIndex}`} className="p-1">
                      <button
                        type="button"
                        ref={(element) => {
                          if (!nestedButtonsRef.current[rowIndex]) {
                            nestedButtonsRef.current[rowIndex] = [];
                          }
                          nestedButtonsRef.current[rowIndex][colIndex] = element;
                        }}
                        onKeyDown={(event) => {
                          const maxRow = nestedRows.length - 1;
                          const maxCol = nestedRows[0].length - 1;
                          if (event.key === "Enter") {
                            event.stopPropagation();
                            event.preventDefault();
                            setOpen(false);
                          } else if (event.key === "ArrowUp") {
                            event.stopPropagation();
                            event.preventDefault();
                            if (rowIndex === 0 && colIndex === 0) {
                              focusEditorAtEnd();
                              return;
                            }
                            focusNestedCell(rowIndex - 1, colIndex);
                          } else if (event.key === "ArrowDown") {
                            event.stopPropagation();
                            event.preventDefault();
                            focusNestedCell(rowIndex + 1, colIndex);
                          } else if (event.key === "ArrowLeft") {
                            event.stopPropagation();
                            event.preventDefault();
                            focusNestedCell(rowIndex, colIndex - 1);
                          } else if (event.key === "ArrowRight") {
                            event.stopPropagation();
                            event.preventDefault();
                            focusNestedCell(rowIndex, colIndex + 1);
                          } else if (event.key === "Tab") {
                            event.stopPropagation();
                            event.preventDefault();
                            if (event.shiftKey) {
                              if (rowIndex === 0 && colIndex === 0) {
                                focusEditorAtEnd();
                              } else if (colIndex === 0) {
                                focusNestedCell(rowIndex - 1, maxCol);
                              } else {
                                focusNestedCell(rowIndex, colIndex - 1);
                              }
                            } else if (rowIndex === maxRow && colIndex === maxCol) {
                              focusNestedCell(0, 0);
                            } else if (colIndex === maxCol) {
                              focusNestedCell(rowIndex + 1, 0);
                            } else {
                              focusNestedCell(rowIndex, colIndex + 1);
                            }
                          }
                        }}
                        className="w-full rounded-sm border px-2 py-1 text-left text-xs focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:outline-none"
                      >
                        <div className="font-medium">{cell.label}</div>
                        <div className="text-muted-foreground truncate">{cell.value}</div>
                      </button>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </PopoverContent>
    </Popover>
  );
}
