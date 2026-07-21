import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { type FieldErrors, type UseFormRegister } from "react-hook-form";
import { useEffect, useState } from "react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface ValidationFormProps {
  register: UseFormRegister<any>;
  errors: FieldErrors;
  disableInput?: boolean;
}

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => setMatches(event.matches);
    mediaQuery.addEventListener("change", handler);

    return () => mediaQuery.removeEventListener("change", handler);
  }, [query]);

  return matches;
}

export function useIsMobile() {
  return useMediaQuery("(max-width: 767px)"); // below md
}

export function useIsMd() {
  return useMediaQuery("(min-width: 768px) and (max-width: 1023px)");
}

export function useIsLg() {
  return useMediaQuery("(min-width: 1024px) and (max-width: 1279px)");
}

export function useIsXl() {
  return useMediaQuery("(min-width: 1280px)");
}

// Or "at least" helpers
export function useIsMdUp() {
  return useMediaQuery("(min-width: 768px)");
}

export function useIsLgUp() {
  return useMediaQuery("(min-width: 1024px)");
}

export function parseDateToLocal(dateString: string) : string{
  const date = new Date(dateString);
  return date.toLocaleString();
}
