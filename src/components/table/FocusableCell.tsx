import { useState, useEffect, useRef, ReactNode } from "react";

export default function FocusableCell(props: { children: ReactNode }) {
const [isCellFocused, setIsCellFocused] = useState(false);
  const cellRef = useRef(null);
  const elementRef = useRef<HTMLElement>(null);
  // useEffect(() => {
  //   if (isCellFocused) {
  //     elementRef.current?.focus();
  //   }
  // }, [isCellFocused])

  /*
  const keyPressListener = (event) => {
    // event.stopPropagation();
    console.log("On Key press")
    console.log("Current Target: ", event.currentTarget);
    console.log("Target: ", event.target);
    console.log("-----")
    if (event.key === 'Enter') {
      buttonRef.current?.focus();
    }
  }
    */

  return (
    <>
      <div ref={cellRef} className="z-50 absolute top-0 left-0 w-full h-full" tabIndex={0} 
        onFocus={() => setIsCellFocused(true)} 
        onBlur={() => setIsCellFocused(false)}>
      </div>
      <div ref={elementRef}>
        {props.children}
      </div>
    </>
  )
}
