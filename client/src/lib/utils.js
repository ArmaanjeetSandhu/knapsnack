import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const preventInvalidIntegerChars = (e) => {
  if ([".", "+", "-", "e", "E"].includes(e.key)) e.preventDefault();
};

export const preventInvalidFloatChars = (e) => {
  if (["+", "-", "e", "E"].includes(e.key)) e.preventDefault();
};

export const validateMaxTwoDecimals = (value) => {
  if (!value) return true;
  const regex = /^\d*\.?\d{0,2}$/;
  return regex.test(value);
};
