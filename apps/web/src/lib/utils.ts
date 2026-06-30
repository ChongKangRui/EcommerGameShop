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


