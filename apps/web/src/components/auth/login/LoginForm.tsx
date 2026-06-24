import { useForm } from "react-hook-form";

import {
  Field,
  FieldGroup,
  FieldDescription,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { type ValidationFormProps } from "@/lib/utils";

export default function LoginForm({ register, errors, disableInput=false }: ValidationFormProps) {




  return (
    <FieldGroup className="grid max-w-sm grid-cols-2 col-span-full">

      {/* Email */}
      <Field className="col-span-2">
        <FieldLabel htmlFor="form-email">
          Email <span className="text-destructive">*</span>
        </FieldLabel>
        <Input
          id="form-email"
          type="text"
          placeholder="john@example.com"
          disabled = {disableInput}
          {...register("email")}
        />
        {errors.email && (
          <p className="text-destructive text-sm mt-1">
            {errors.email.message as string}
          </p>
        )}
      </Field>
      {/* password */}
      <Field className="col-span-2">
        <FieldLabel htmlFor="password">Password  <span className="text-destructive">*</span> </FieldLabel>
        
        <Input id="password" type="password" placeholder="••••••••"
        disabled = {disableInput}
        {...register("password")} />
         {errors.password && (
          <p className="text-destructive text-sm mt-1">
            {errors.password.message as string}
          </p>
        )}
      </Field>
    </FieldGroup>
  );
}
