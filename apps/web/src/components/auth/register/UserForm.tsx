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
import { type RegisterFormProps } from "@/lib/utils";

export default function UserForm({ register, errors }: RegisterFormProps) {
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
          {...register("firstName", { required: "First name is required" })}
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
          {...register("lastName", { required: "Last name is required" })}
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
          type="email"
          placeholder="john@example.com"
          {...register("email", {
            required: "Email is required and must be valid",
            pattern: { value: /^\S+@\S+$/i, message: "Invalid email" },
          })}
        />
        {errors.email && (
          <p className="text-destructive text-sm mt-1">
            {errors.email.message as string}
          </p>
        )}
      </Field>
      {/* password */}
      <Field className="col-span-2">
        <FieldLabel htmlFor="password">Password</FieldLabel>
        <FieldDescription>Must be at least 8 characters long.</FieldDescription>
        <Input id="password" type="password" placeholder="••••••••"{...register("email", {
            required: "Email is required and must be valid",
            pattern: { value: /^\S+@\S+$/i, message: "Invalid email" },
          })} />
      </Field>
    </FieldGroup>
  );
}
