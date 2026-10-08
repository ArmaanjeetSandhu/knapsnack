import {
  animate,
  useMotionTemplate,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";

import type { MotionValue, PanInfo } from "framer-motion";
import type { RefObject } from "react";

export interface UseRevealSliderReturn {
  containerRef: RefObject<HTMLDivElement | null>;
  containerWidth: number;
  x: MotionValue<number>;
  isAtRight: boolean;
  clipPath: MotionValue<string>;
  snapTo: (target: number) => void;
  handleDragEnd: (
    e: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => void;
  handleToggle: () => void;
}

export const useRevealSlider = (): UseRevealSliderReturn => {
  const containerRef = useRef<HTMLDivElement>(null);
  const prevWidthRef = useRef<number>(0);
  const containerWidthRef = useRef<number>(1000);

  const [containerWidth, setContainerWidth] = useState(0);
  const [isAtRight, setIsAtRight] = useState(true);

  const x = useMotionValue(5000);

  useEffect(() => {
    const unsubscribe = x.on("change", (latestX) => {
      const w = containerWidthRef.current || 1000;
      setIsAtRight(latestX > w / 2);
    });

    return () => unsubscribe();
  }, [x]);

  useEffect(() => {
    const measure = () => {
      if (!containerRef.current) return;

      const w = containerRef.current.offsetWidth;
      setContainerWidth(w);
      containerWidthRef.current = w;

      const prevW = prevWidthRef.current || w;
      const ratio = x.get() / prevW;

      if (ratio > 0.5) x.set(w);
      else x.set(0);

      prevWidthRef.current = w;
    };

    measure();
    globalThis.addEventListener("resize", measure);
    return () => globalThis.removeEventListener("resize", measure);
  }, [x]);

  const clipPathRight = useTransform(x, (latestX) => {
    const w = containerWidthRef.current || 1000;
    const progress = Math.min(Math.max(latestX / w, 0), 1);
    return 100 - progress * 100;
  });

  const clipPath = useMotionTemplate`inset(0% ${clipPathRight}% 0% 0%)`;

  const snapTo = (t: number) =>
    animate(x, t, { type: "spring", stiffness: 300, damping: 30 });

  const handleDragEnd = (
    _e: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    const vel = info.velocity.x;
    if (vel < -300) return snapTo(0);
    if (vel > 300) return snapTo(containerWidth);
    snapTo(x.get() < containerWidth / 2 ? 0 : containerWidth);
  };

  const handleToggle = () =>
    x.get() > containerWidth / 2 ? snapTo(0) : snapTo(containerWidth);

  return {
    containerRef,
    containerWidth,
    x,
    isAtRight,
    clipPath,
    snapTo,
    handleDragEnd,
    handleToggle,
  };
};
