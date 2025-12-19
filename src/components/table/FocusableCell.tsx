import { useState, useRef, type ComponentType, type KeyboardEvent } from "react";

// withFocusableCell
export default function FocusableCell<P extends object>(BaseComponent: ComponentType<P>) {

  // need to handle onClick as well
  return function(props:P) {
    const [isCellFocused, setIsCellFocused] = useState(false);
    const cellRef = useRef<HTMLDivElement>(null);
    const elementRef = useRef<HTMLDivElement>(null);

    const keyPressListener = (event:KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        event.stopPropagation();
        if (elementRef.current) { 
          elementRef.current.click();
        }
      }
    }

    // TODO - handle onClick for the button

    return (
      <>
        <div 
          ref={cellRef} 
          onKeyDown={keyPressListener} 
          className="z-50 absolute top-0 left-0 w-full h-full bg-blue/500 cursor-pointer" 
          tabIndex={0} 
          onFocus={() => setIsCellFocused(true)} 
          onBlur={() => setIsCellFocused(false)}
          onClick={() => console.log("clicked on cell")}
          >
        </div>
        <BaseComponent {...props} ref={elementRef} />
      </>
    )
  }
} 
