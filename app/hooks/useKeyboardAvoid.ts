"use client";

import { useState, useEffect } from "react";

export function useKeyboardAvoid() {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const vv = typeof window !== "undefined" ? window.visualViewport : null;
    if (!vv) return;

    function handleResize() {
      const keyboardHeight = window.innerHeight - vv!.height;
      setOffset(keyboardHeight > 50 ? keyboardHeight / 2 : 0);
    }

    vv.addEventListener("resize", handleResize);
    return () => vv.removeEventListener("resize", handleResize);
  }, []);

  return offset;
}
