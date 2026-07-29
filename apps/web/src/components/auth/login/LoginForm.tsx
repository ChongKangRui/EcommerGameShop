
import {
  FieldGroup,
} from "@/components/ui/field";

import { type ValidationFormProps } from "@/lib/utils";
import FormField from "@/components/FormField";

export default function LoginForm({
  register,
  errors,
  disableInput = false,
}: ValidationFormProps) {
  return (
    <FieldGroup className="grid max-w-sm grid-cols-2 col-span-full">
      {/* Email */}
      <FormField
        className="col-span-2"
        id="login-email"
        label="Email"
        type="text"
        disabled={disableInput}
        register={register("email")}
        error={errors.email}
        required={true}
      ></FormField>
     
      {/* password */}
      <FormField
        className="col-span-2"
        id="login-email"
        label="password"
        type="password"
        disabled={disableInput}
        register={register("password")}
        error={errors.password}
        required={true}
      ></FormField>
     
    </FieldGroup>
  );
}
