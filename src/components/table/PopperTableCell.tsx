import { useEffect, useMemo, useRef, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button, buttonVariants } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  POPPER_NESTED_DEFAULTS,
  type PopperColumnValue,
} from "@/components/table/types";

type NestedFieldKey = keyof Pick<
  PopperColumnValue,
  "details" | "role" | "skills" | "department" | "experience"
>;

type NestedFieldDef = { key: NestedFieldKey; label: string };

/** Row 0: full-width Details; rows 1–2: two half-width cells */
const POPPER_GRID: Array<
  | { span: "full"; field: NestedFieldDef }
  | { span: "half"; left: NestedFieldDef; right: NestedFieldDef }
> = [
  { span: "full", field: { key: "details", label: "Details" } },
  {
    span: "half",
    left: { key: "role", label: "Role" },
    right: { key: "skills", label: "Skills" },
  },
  {
    span: "half",
    left: { key: "department", label: "Department" },
    right: { key: "experience", label: "Experience" },
  },
];

const MAX_ROW = 2;
const MAX_COL = 1;

/** Matches Tailwind max-h-24 — keeps details edit/display height stable */
const DETAILS_MAX_PX = 96;
/** Single-line nested fields: same row height in display vs input */
const COMPACT_FIELD_ROW = "min-h-7 max-h-7 py-0 leading-7";
const COMPACT_INPUT_CLASS =
  "h-7 min-h-7 max-h-7 border-0 py-0 leading-7";

function normalizePopperValue(value: unknown): PopperColumnValue {
  if (value && typeof value === "object" && "details" in value) {
    const v = value as Record<string, unknown>;
    return {
      details: String(v.details ?? ""),
      role:
        v.role !== undefined && v.role !== null
          ? String(v.role)
          : POPPER_NESTED_DEFAULTS.role,
      skills:
        v.skills !== undefined && v.skills !== null
          ? String(v.skills)
          : POPPER_NESTED_DEFAULTS.skills,
      department:
        v.department !== undefined && v.department !== null
          ? String(v.department)
          : POPPER_NESTED_DEFAULTS.department,
      experience:
        v.experience !== undefined && v.experience !== null
          ? String(v.experience)
          : POPPER_NESTED_DEFAULTS.experience,
    };
  }
  if (typeof value === "string") {
    return {
      details: value,
      ...POPPER_NESTED_DEFAULTS,
    };
  }
  return {
    details: "",
    ...POPPER_NESTED_DEFAULTS,
  };
}

interface PopperTableCellProps {
  value: unknown;
  triggerText?: string;
  isEditing: boolean;
  onChange?: (value: PopperColumnValue) => void;
  onRegisterFocusTrigger?: (focusFn: (() => void) | null) => void;
}

export function PopperTableCell({
  value: rawValue,
  triggerText = "View",
  isEditing,
  onChange,
  onRegisterFocusTrigger,
}: PopperTableCellProps) {
  const value = useMemo(() => normalizePopperValue(rawValue), [rawValue]);

  const [open, setOpen] = useState(false);
  const [nestedSelected, setNestedSelected] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [nestedEditing, setNestedEditing] = useState<{
    row: number;
    col: number;
  } | null>(null);

  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const doneButtonRef = useRef<HTMLButtonElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const nestedInputsRef = useRef<
    Array<Array<HTMLInputElement | HTMLTextAreaElement | null>>
  >([]);
  const nestedWrappersRef = useRef<Array<Array<HTMLDivElement | null>>>([]);

  const patch = (partial: Partial<PopperColumnValue>) => {
    onChange?.({ ...value, ...partial });
  };

  const resizeDetailsTextarea = () => {
    const ta = nestedInputsRef.current[0]?.[0];
    if (!ta || ta.tagName !== "TEXTAREA") return;
    const el = ta as HTMLTextAreaElement;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, DETAILS_MAX_PX)}px`;
  };

  const focusTrigger = () => {
    triggerRef.current?.focus();
  };

  const focusDoneButton = () => {
    requestAnimationFrame(() => {
      doneButtonRef.current?.focus();
    });
  };

  const focusNestedCellSelected = (row: number, col: number) => {
    const nextRow = Math.max(0, Math.min(MAX_ROW, row));
    const nextCol = Math.max(0, Math.min(MAX_COL, col));
    setNestedSelected({ row: nextRow, col: nextCol });
    setNestedEditing(null);
    requestAnimationFrame(() => {
      nestedWrappersRef.current[nextRow]?.[nextCol]?.focus();
    });
  };

  useEffect(() => {
    if (!nestedEditing || !open) return;
    requestAnimationFrame(() => {
      const row = nestedEditing.row;
      const col = nestedEditing.col;
      const input = nestedInputsRef.current[row]?.[col];
      if (!input) return;
      input.focus();
      if (row === 0 && col === 0 && input.tagName === "TEXTAREA") {
        const el = input as HTMLTextAreaElement;
        const end = el.value.length;
        el.setSelectionRange(end, end);
        resizeDetailsTextarea();
      }
    });
  }, [nestedEditing, open]);

  useEffect(() => {
    if (!open || !isEditing) return;
    if (nestedEditing?.row !== 0 || nestedEditing?.col !== 0) return;
    requestAnimationFrame(() => resizeDetailsTextarea());
  }, [value.details, open, isEditing, nestedEditing]);

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
    if (!open) {
      setNestedSelected(null);
      setNestedEditing(null);
    }
  }, [open]);

  const handleNestedCellClick = (rowIndex: number, colIndex: number) => {
    const isSame =
      nestedSelected?.row === rowIndex && nestedSelected?.col === colIndex;
    if (isSame) {
      if (nestedEditing?.row === rowIndex && nestedEditing?.col === colIndex) {
        return;
      }
      setNestedEditing({ row: rowIndex, col: colIndex });
    } else {
      setNestedSelected({ row: rowIndex, col: colIndex });
      setNestedEditing(null);
    }
  };

  const handleNestedNavigateKeyDown = (
    event: React.KeyboardEvent,
    rowIndex: number,
    colIndex: number,
  ) => {
    if (event.key === "Enter") {
      event.stopPropagation();
      event.preventDefault();
      if (nestedEditing?.row === rowIndex && nestedEditing?.col === colIndex) {
        focusNestedCellSelected(rowIndex, colIndex);
        return;
      }
      const isSame =
        nestedSelected?.row === rowIndex && nestedSelected?.col === colIndex;
      if (isSame) {
        setNestedEditing({ row: rowIndex, col: colIndex });
      } else {
        setNestedSelected({ row: rowIndex, col: colIndex });
        setNestedEditing(null);
      }
      return;
    }
    if (event.key === "ArrowUp") {
      event.stopPropagation();
      event.preventDefault();
      if (rowIndex === 0 && colIndex === 0) {
        focusTrigger();
        return;
      }
      if (rowIndex === 1) {
        focusNestedCellSelected(0, 0);
        return;
      }
      focusNestedCellSelected(rowIndex - 1, colIndex);
    } else if (event.key === "ArrowDown") {
      event.stopPropagation();
      event.preventDefault();
      if (rowIndex === 0 && colIndex === 0) {
        focusNestedCellSelected(1, 0);
        return;
      }
      if (rowIndex === MAX_ROW) {
        focusDoneButton();
        return;
      }
      focusNestedCellSelected(rowIndex + 1, colIndex);
    } else if (event.key === "ArrowLeft") {
      event.stopPropagation();
      event.preventDefault();
      if (rowIndex === 0 && colIndex === 0) {
        focusTrigger();
        return;
      }
      if (colIndex === 0) {
        focusNestedCellSelected(rowIndex - 1, MAX_COL);
        return;
      }
      focusNestedCellSelected(rowIndex, colIndex - 1);
    } else if (event.key === "ArrowRight") {
      event.stopPropagation();
      event.preventDefault();
      if (rowIndex === 0 && colIndex === 0) {
        focusNestedCellSelected(1, 1);
        return;
      }
      if (colIndex === MAX_COL) {
        focusNestedCellSelected(rowIndex + 1, 0);
        return;
      }
      focusNestedCellSelected(rowIndex, colIndex + 1);
    } else if (event.key === "Tab") {
      event.stopPropagation();
      event.preventDefault();
      if (event.shiftKey) {
        if (rowIndex === 0 && colIndex === 0) {
          focusTrigger();
        } else if (colIndex === 0) {
          focusNestedCellSelected(rowIndex - 1, MAX_COL);
        } else {
          focusNestedCellSelected(rowIndex, colIndex - 1);
        }
      } else if (rowIndex === MAX_ROW && colIndex === MAX_COL) {
        focusDoneButton();
      } else if (rowIndex === 0 && colIndex === 0) {
        focusNestedCellSelected(1, 0);
      } else if (colIndex === MAX_COL) {
        focusNestedCellSelected(rowIndex + 1, 0);
      } else {
        focusNestedCellSelected(rowIndex, colIndex + 1);
      }
    }
  };

  const nestedCellState = (rowIndex: number, colIndex: number) => {
    if (!isEditing) return "idle" as const;
    if (nestedEditing?.row === rowIndex && nestedEditing?.col === colIndex) {
      return "editing" as const;
    }
    if (nestedSelected?.row === rowIndex && nestedSelected?.col === colIndex) {
      return "selected" as const;
    }
    return "idle" as const;
  };

  const setInputRef = (
    rowIndex: number,
    colIndex: number,
    element: HTMLInputElement | HTMLTextAreaElement | null,
  ) => {
    if (!nestedInputsRef.current[rowIndex]) {
      nestedInputsRef.current[rowIndex] = [];
    }
    nestedInputsRef.current[rowIndex][colIndex] = element;
  };

  const renderNestedCard = (
    field: NestedFieldDef,
    rowIndex: number,
    colIndex: number,
  ) => {
    const state = nestedCellState(rowIndex, colIndex);
    const showInput =
      isEditing &&
      nestedEditing?.row === rowIndex &&
      nestedEditing?.col === colIndex;
    const isDetails = field.key === "details";

    return (
      <div
        data-popper-nested-cell
        data-nested-cell-state={state}
        className={cn(
          "rounded-sm border px-2 py-1 text-xs ring-2 ring-inset transition-[border-color,box-shadow]",
          state === "idle" && "ring-transparent",
          state === "selected" &&
            "ring-primary/70 [&_.popper-nested-value]:pointer-events-none",
          state === "editing" && "ring-blue-500",
        )}
        onClick={(event) => {
          if (!isEditing) return;
          if (
            (event.target as HTMLElement).closest(
              "input.popper-nested-input, textarea.popper-nested-input",
            )
          ) {
            return;
          }
          handleNestedCellClick(rowIndex, colIndex);
        }}
      >
        <div className="font-medium">{field.label}</div>
        {isEditing && showInput ? (
          isDetails ? (
            <textarea
              ref={(element) => setInputRef(rowIndex, colIndex, element)}
              data-cell-editor="true"
              rows={1}
              value={value.details}
              onChange={(event) => {
                patch({ details: event.target.value });
                requestAnimationFrame(() => resizeDetailsTextarea());
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.stopPropagation();
                  event.preventDefault();
                  focusNestedCellSelected(rowIndex, colIndex);
                } else if (
                  event.key === "ArrowUp" ||
                  event.key === "ArrowDown" ||
                  event.key === "ArrowLeft" ||
                  event.key === "ArrowRight" ||
                  event.key === "Tab"
                ) {
                  handleNestedNavigateKeyDown(event, rowIndex, colIndex);
                }
              }}
              className="popper-nested-input mt-0.5 box-border max-h-24 min-h-7 w-full min-w-0 resize-none overflow-y-auto bg-transparent py-0 text-sm leading-snug text-muted-foreground outline-none focus-visible:outline-none"
            />
          ) : (
            <input
              ref={(element) => setInputRef(rowIndex, colIndex, element)}
              type="text"
              value={value[field.key]}
              onChange={(event) => patch({ [field.key]: event.target.value })}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.stopPropagation();
                  event.preventDefault();
                  focusNestedCellSelected(rowIndex, colIndex);
                } else if (
                  event.key === "ArrowUp" ||
                  event.key === "ArrowDown" ||
                  event.key === "ArrowLeft" ||
                  event.key === "ArrowRight" ||
                  event.key === "Tab"
                ) {
                  handleNestedNavigateKeyDown(event, rowIndex, colIndex);
                }
              }}
              className={cn(
                "popper-nested-input mt-0.5 box-border w-full min-w-0 bg-transparent text-xs text-muted-foreground outline-none focus-visible:outline-none",
                COMPACT_INPUT_CLASS,
              )}
            />
          )
        ) : isEditing ? (
          <div
            ref={(element) => {
              if (!nestedWrappersRef.current[rowIndex]) {
                nestedWrappersRef.current[rowIndex] = [];
              }
              nestedWrappersRef.current[rowIndex][colIndex] = element;
            }}
            role="button"
            tabIndex={0}
            className={cn(
              "popper-nested-value mt-0.5 cursor-default text-muted-foreground outline-none focus-visible:outline-none",
              isDetails
                ? "max-h-24 overflow-y-auto whitespace-pre-wrap break-words text-sm leading-snug"
                : cn("truncate text-xs", COMPACT_FIELD_ROW),
            )}
            onKeyDown={(event) =>
              handleNestedNavigateKeyDown(event, rowIndex, colIndex)
            }
          >
            {isDetails ? value.details || "—" : value[field.key] || "—"}
          </div>
        ) : (
          <div
            className={cn(
              "mt-0.5 text-xs text-muted-foreground",
              isDetails &&
                "max-h-24 overflow-y-auto whitespace-pre-wrap break-words text-sm leading-snug",
              !isDetails && cn("truncate", COMPACT_FIELD_ROW),
            )}
          >
            {isDetails ? value.details || "—" : value[field.key] || "—"}
          </div>
        )}
      </div>
    );
  };

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
            focusNestedCellSelected(0, 0);
          });
        }}
      >
        <div className="flex flex-col gap-3">
          <Table className="table-fixed">
            <TableBody>
              {POPPER_GRID.map((rowDef, rowIndex) => {
                if (rowDef.span === "full") {
                  return (
                    <TableRow
                      key={`popper-row-${rowIndex}`}
                      className="hover:bg-transparent"
                    >
                      <TableCell colSpan={2} className="p-1 align-top">
                        {renderNestedCard(rowDef.field, rowIndex, 0)}
                      </TableCell>
                    </TableRow>
                  );
                }
                return (
                  <TableRow
                    key={`popper-row-${rowIndex}`}
                    className="hover:bg-transparent"
                  >
                    <TableCell className="w-1/2 p-1 align-top">
                      {renderNestedCard(rowDef.left, rowIndex, 0)}
                    </TableCell>
                    <TableCell className="w-1/2 p-1 align-top">
                      {renderNestedCard(rowDef.right, rowIndex, 1)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <div className="flex justify-end">
            <button
              ref={doneButtonRef}
              type="button"
              data-popper-done
              className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}
              onClick={() => setOpen(false)}
              onKeyDown={(event) => {
                event.stopPropagation();
                if (event.key === "ArrowUp") {
                  event.preventDefault();
                  focusNestedCellSelected(MAX_ROW, MAX_COL);
                  return;
                }
                if (event.key === "Tab") {
                  event.preventDefault();
                  if (event.shiftKey) {
                    focusNestedCellSelected(MAX_ROW, MAX_COL);
                  } else {
                    focusTrigger();
                  }
                }
              }}
            >
              Done
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
