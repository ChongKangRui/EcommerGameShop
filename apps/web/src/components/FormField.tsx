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
  inputClassname?: string;
  type?: string;
  placeholder?: string;
  step?:number;
  required?: boolean;
  disabled?: boolean;
  error?: FieldError | Merge<FieldError, FieldErrorsImpl<any>> | undefined;
  register?: UseFormRegisterReturn;
  onChange?: (e: React.ChangeEvent<HTMLInputElement> )=>void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>)=> void
}

export default function FormField({
  id,
  label,
  className,
  inputClassname,
  type = "text",
  placeholder,
  step,
  required = false,
  disabled = false,
  error,
  register,
  onChange,
  onKeyDown
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
         className={inputClassname}
         onChange={onChange}
        {...register}
       onKeyDown={onKeyDown}
      />
      {error && (
        <p className="text-destructive text-sm mt-1">
          {error.message as string}
        </p>
      )}
    </Field>
  );
}
