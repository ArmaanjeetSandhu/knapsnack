import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { KeyboardEvent, RefObject } from "react";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export const preventInvalidIntegerChars = (e: KeyboardEvent): void => {
  if ([".", "+", "-", "e", "E"].includes(e.key)) e.preventDefault();
};

export const preventInvalidFloatChars = (e: KeyboardEvent): void => {
  if (["+", "-", "e", "E"].includes(e.key)) e.preventDefault();
};

export const validateMaxTwoDecimals = (value: string | undefined): boolean => {
  if (!value) return true;
  return /^\d*\.?\d{0,2}$/.test(value);
};

export const formatDate = (dateString: string): string =>
  new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

export const smoothScrollTo = (
  ref: RefObject<HTMLElement | null>,
  delay = 0,
): void => {
  setTimeout(() => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  }, delay);
};
