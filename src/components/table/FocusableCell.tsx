import { useState, useRef, type ComponentType, type KeyboardEvent, type MouseEvent } from "react";

export default function FocusableCell<P extends object>(BaseComponent: ComponentType<P>) {

  return function(props:P) {
    const [isCellFocused, setIsCellFocused] = useState(false);
    const cellRef = useRef<HTMLDivElement>(null);
    const elementRef = useRef<HTMLDivElement>(null);

    const clickOnElement = () => {
      if (elementRef.current) { 
        elementRef.current.click();
      }
    }

    const keyPressListener = (event:KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        event.stopPropagation();
        // Tried dispatching an Enter key event but that didn't work.
        // I don't think browsers or React respond to synthetic key events
        clickOnElement();
      }
    }

    const handleClick = (event:MouseEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      clickOnElement();
    }

    return (
      <>
        <div 
          ref={cellRef} 
          onKeyDown={keyPressListener} 
          className="z-50 absolute top-0 left-0 w-full h-full bg-blue/500 cursor-pointer" 
          tabIndex={0} 
          onFocus={() => setIsCellFocused(true)} 
          onBlur={() => setIsCellFocused(false)}
          onClick={handleClick}
          >
        </div>
        <BaseComponent {...props} ref={elementRef} />
      </>
    )
  }
} 
