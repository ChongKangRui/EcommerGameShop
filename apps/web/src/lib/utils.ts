import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import {type FieldErrors, type UseFormRegister } from 'react-hook-form';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface ValidationFormProps {
  register: UseFormRegister<any>;
  errors: FieldErrors;
  disableInput?: boolean;
}