

import {
  Field,
  FieldGroup,
  FieldLabel,

} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { type ValidationFormProps } from "@/lib/utils";

export default function UserProfile({ register, errors, disableInput = false }: ValidationFormProps) {

  return (
    <FieldGroup className="grid max-w-sm grid-cols-2 col-span-full">
      {/* first name */}
      <Field>
        <FieldLabel htmlFor="first-name">
          First Name
        </FieldLabel>
        <Input
        id="first-name"
       
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
          Last Name 
        </FieldLabel>
        <Input
          id="last-name"
         
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
          Email
        </FieldLabel>
        <Input
          id="form-email"
          type="text"
          
           disabled={disableInput}
          {...register("email")}
        />
        {errors.email && (
          <p className="text-destructive text-sm mt-1">
            {errors.email.message as string}
          </p>
        )}
      </Field>

       {/* Address */}
      <Field className="col-span-2">
        <FieldLabel htmlFor="form-address">
          Address
        </FieldLabel>
        <Input
          id="form-address"
          type="text"
          
           disabled={disableInput}
          {...register("address")}
        />
        {errors.address && (
          <p className="text-destructive text-sm mt-1">
            {errors.address.message as string}
          </p>
        )}
      </Field>
      {/* password */}
      {/* <Field className="col-span-2">
        <FieldLabel htmlFor="password">Password <span className="text-destructive">*</span></FieldLabel>
        <FieldDescription>Must be at least 8 characters long.</FieldDescription>
        <Input id="password" type="password" placeholder="••••••••"  disabled={disableInput} {...register("password")} />
         {errors.password && (
          <p className="text-destructive text-sm mt-1">
            {errors.password.message as string}
          </p>
        )}
      </Field> */}
    </FieldGroup>
  );
}
