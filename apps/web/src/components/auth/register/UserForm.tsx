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
import FormField from "../../FormField";

import { registerDataSchema } from "@ecom/shared/src/registerDataSchema";

export default function UserForm({
  register,
  errors,
  disableInput = false,
}: ValidationFormProps) {
  return (
    <FieldGroup className="grid max-w-sm grid-cols-2 col-span-full">
      {/* first name */}
      <FormField
        className=""
        id="register-first-name"
        label="First Name"
        type="text"
        placeholder="Jordan"
        disabled={disableInput}
        register={register("firstName")}
        error={errors.firstName}
        required={true}
      ></FormField>

      {/* last name */}
      <FormField
        className=""
        id="register-last-name"
        label="Last Name"
        type="text"
        placeholder="Lee"
        disabled={disableInput}
        register={register("lastName")}
        error={errors.lastName}
        required={true}
      ></FormField>

      {/* Email */}
<FormField
        className="col-span-2"
        id="register-email"
        label="Email"
        type="text"
        placeholder="john@example.com"
        disabled={disableInput}
        register={register("email")}
        error={errors.email}
        required={true}
      ></FormField>

      {/* password */}
      <FormField
        className="col-span-2"
        id="register-password"
        label="Password"
        type="password"
        placeholder="john@example.com"
        disabled={disableInput}
        register={register("password")}
        error={errors.password}
        required={true}
      ></FormField>

    </FieldGroup>
  );
}
