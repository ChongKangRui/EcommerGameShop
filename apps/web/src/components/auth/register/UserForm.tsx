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

import {registerDataSchema} from "@ecom/shared/src/registerDataSchema"

export default function UserForm({ register, errors, disableInput = false }: ValidationFormProps) {
  return (
    <FieldGroup className="grid max-w-sm grid-cols-2 col-span-full">
      {/* first name */}
      <Field>
        <FieldLabel htmlFor="first-name">
          First Name <span className="text-destructive">*</span>
        </FieldLabel>
        <Input
          id="first-name"
          placeholder="Jordan"
          {...register("firstName")}
          disabled={disableInput}
        />
        {errors.firstName && (
          <p className="text-destructive text-sm mt-1">
            {errors.firstName.message as string}
          </p>
        )}
      </Field>

      {/* last name */}
      <Field>
        <FieldLabel htmlFor="last-name">
          Last Name <span className="text-destructive">*</span>
        </FieldLabel>
        <Input
          id="last-name"
          placeholder="Lee"
           disabled={disableInput}
          {...register("lastName")}
        />
        {errors.lastName && (
          <p className="text-destructive text-sm mt-1">
            {errors.lastName.message as string}
          </p>
        )}
      </Field>

      {/* Email */}
      <Field className="col-span-2">
        <FieldLabel htmlFor="form-email">
          Email <span className="text-destructive">*</span>
        </FieldLabel>
        <Input
          id="form-email"
          type="text"
          placeholder="john@example.com"
           disabled={disableInput}
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
        <FieldLabel htmlFor="password">Password <span className="text-destructive">*</span></FieldLabel>
        <FieldDescription>Must be at least 8 characters long.</FieldDescription>
        <Input id="password" type="password" placeholder="••••••••"  disabled={disableInput} {...register("password")} />
         {errors.password && (
          <p className="text-destructive text-sm mt-1">
            {errors.password.message as string}
          </p>
        )}
      </Field>
    </FieldGroup>
  );
}
