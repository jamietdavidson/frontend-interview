import { useState, useRef, useEffect } from "react";
import * as KeyCode from "keycode-js";
import { TableCell } from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface PopperTableCellProps extends React.ComponentProps<typeof TableCell> {
  value: string;
  triggerText?: string;
  shouldFocusButton?: boolean;
  isSelected?: boolean;
  onUpdate?: (newValue: string) => void;
}

export function PopperTableCell({
  value,
  triggerText = "View",
  shouldFocusButton = false,
  isSelected = false,
  onUpdate,
  ...cellProps
}: PopperTableCellProps) {
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (shouldFocusButton && buttonRef.current) {
      buttonRef.current.focus();
    } else if (!shouldFocusButton && buttonRef.current) {
      buttonRef.current.blur();
    }
  }, [shouldFocusButton]);

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && !isSelected) {
      return;
    }
    setOpen(newOpen);

    if (
      !newOpen &&
      buttonRef.current &&
      document.activeElement === buttonRef.current
    ) {
      buttonRef.current.blur();
    }
  };

  useEffect(() => {
    if (!isSelected) {
      setOpen(false);
      setIsEditing(false);
    }
  }, [isSelected]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  const handleSave = () => {
    if (onUpdate && editValue !== value) {
      onUpdate(editValue);
    }
    setIsEditing(false);
    setOpen(false);
  };

  return (
    <TableCell {...cellProps}>
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            ref={buttonRef}
            variant="outline"
            size="sm"
            tabIndex={shouldFocusButton ? 0 : -1}
            className="focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            onKeyDown={(e) => {
              if (e.key === KeyCode.VALUE_ENTER && shouldFocusButton) {
                e.preventDefault();
                e.stopPropagation();
                setOpen(true);
              }
            }}
          >
            {triggerText}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Details</h4>
            {isEditing ? (
              <textarea
                ref={textareaRef}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === KeyCode.VALUE_ENTER && e.ctrlKey) {
                    e.preventDefault();
                    handleSave();
                  } else if (e.key === KeyCode.VALUE_ESCAPE) {
                    setEditValue(value);
                    setIsEditing(false);
                    setOpen(false);
                  }
                }}
                className="w-full min-h-[100px] px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <div
                ref={contentRef}
                tabIndex={0}
                onClick={() => setIsEditing(true)}
                onKeyDown={(e) => {
                  if (e.key === KeyCode.VALUE_ENTER) {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsEditing(true);
                  }
                }}
                className="text-sm text-muted-foreground break-words focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-1 cursor-pointer hover:bg-muted/50"
              >
                {value}
              </div>
            )}
            {isEditing && (
              <div className="flex gap-2 text-xs text-muted-foreground">
                <span>Ctrl+Enter to save</span>
                <span>•</span>
                <span>Esc to cancel</span>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </TableCell>
  );
}
