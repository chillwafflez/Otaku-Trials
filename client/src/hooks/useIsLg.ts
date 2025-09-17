import { useEffect, useState } from "react";

// checks if current layout is a browser layout (at least 1024px wide)
export function useIsLg() {
  const [isLg, setIsLg] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)"); // tailwind's lg
    const onChange = () => setIsLg(mq.matches);
    onChange();                       // set initial
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return isLg;
}
