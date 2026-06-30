import type { FieldError , UseFormRegisterReturn, Merge, FieldErrorsImpl} from "react-hook-form";
import {
  Field,
  FieldGroup,
  FieldDescription,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

interface FormFieldProps {
  id: string;
  label: string;
  className?:string;
  type?: string;
  placeholder?: string;
  step?:number;
  required?: boolean;
  disabled?: boolean;
  error?: FieldError | Merge<FieldError, FieldErrorsImpl<any>> | undefined;
  register: UseFormRegisterReturn;
}

export default function FormField({
  id,
  label,
  className,
  type = "text",
  placeholder,
  step,
  required = false,
  disabled = false,
  error,
  register,
}: FormFieldProps) {
  return (
    <Field className={className}>
      <FieldLabel htmlFor={id}>
        {label} {required && <span className="text-destructive">*</span>}
      </FieldLabel>
      <Input
        id={id}
        type={type}
        disabled={disabled}
        step={step}
        placeholder={placeholder}
        {...register}
      />
      {error && (
        <p className="text-destructive text-sm mt-1">
          {error.message as string}
        </p>
      )}
    </Field>
  );
}
