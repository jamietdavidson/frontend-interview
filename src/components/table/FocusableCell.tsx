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

    /*
    One issue with the Enter key event is when the popover is closed via the Escape key,
    the Button receives focus, not the table cell.
    Given that the Button is wrapped in the PopoverTrigger, I'm not sure there's a simple way around this.
    */
    const keyPressListener = (event:KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        event.stopPropagation();
        // Tried dispatching an Enter key event but that didn't work.
        // I don't think browsers or React respond to synthetic key events
        clickOnElement();
      }
    }

    /*
    One issue with the click event is that when clicking the button a second time,
    the popover remains open. Looking at shadcn's docs, clicking on the PopoverTrigger
    should toggle the popover (alternate open/close). Ours remains open since we're calling the click event manually.
    A resolution for this could involve somehow accessing the "open" state from the ButtonPopover, and adding
    some logic to not call clickOnElement if open is true.
    */
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
          className="z-50 absolute top-0 left-0 w-full h-full cursor-pointer" 
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
