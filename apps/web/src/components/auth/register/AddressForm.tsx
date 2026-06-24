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

export default function AddressForm({ register, errors, disableInput = false }: ValidationFormProps) {
  return (
    <FieldSet className="w-full max-w-sm">
      <FieldLegend>Address Information</FieldLegend>
      <FieldDescription>
        We need your address to deliver your order.
      </FieldDescription>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="street">Street Address <span className="text-destructive">*</span></FieldLabel>
          <Input
            id="street"
            type="text"
            placeholder="123 Main St"
             disabled={disableInput}
            {...register("streetAddress")}
          />
          {errors.streetAddress && (
            <p className="text-destructive text-sm mt-1">
              {errors.streetAddress.message as string}
            </p>
          )}
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="city">City <span className="text-destructive">*</span></FieldLabel>
            <Input
              id="city"
              type="text"
              placeholder="New York"
               disabled={disableInput}
              {...register("city")}
              
            />
            {errors.city && (
              <p className="text-destructive text-sm mt-1">
                {errors.city.message as string}
              </p>
            )}
          </Field>
          <Field>
            <FieldLabel htmlFor="zip">Postal Code <span className="text-destructive">*</span></FieldLabel>
            <Input
              id="zip"
              type="text"
              placeholder="90502"
               disabled={disableInput}
              {...register("postalCode")}
            />
            {errors.postalCode && (
              <p className="text-destructive text-sm mt-1">
                {errors.postalCode.message as string}
              </p>
            )}
          </Field>
        </div>
      </FieldGroup>
    </FieldSet>
  );
}
