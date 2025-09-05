import { useEffect, useState } from "react";

/**
 * Tailwind lg(1024px) 이상 여부.
 * SSR 시에는 항상 false 로 시작하여 hydration mismatch 방지.
 */
export default function useIsLgUp() {
  const [isLgUp, setIsLgUp] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsLgUp(mq.matches);
    update(); // mount 직후 동기화
    if (mq.addEventListener) mq.addEventListener("change", update);
    else mq.addListener(update);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", update);
      else mq.removeListener(update);
    };
  }, []);

  return isLgUp;
}
