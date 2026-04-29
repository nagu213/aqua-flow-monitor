import { useEffect, useState } from "react";
import type { TankShape } from "@/components/tankShapes";

const KEY_SHAPE = "tank.shape";
const KEY_SUMP = "tank.withSump";

export function useTankSelection() {
  const [shape, setShape] = useState<TankShape>("classic");
  const [withSump, setWithSump] = useState<boolean>(true);

  useEffect(() => {
    try {
      const s = localStorage.getItem(KEY_SHAPE) as TankShape | null;
      const w = localStorage.getItem(KEY_SUMP);
      if (s) setShape(s);
      if (w !== null) setWithSump(w === "1");
    } catch {
      /* ignore */
    }
  }, []);

  const update = (s: TankShape, w: boolean) => {
    setShape(s);
    setWithSump(w);
    try {
      localStorage.setItem(KEY_SHAPE, s);
      localStorage.setItem(KEY_SUMP, w ? "1" : "0");
    } catch {
      /* ignore */
    }
  };

  return { shape, withSump, setSelection: update };
}
