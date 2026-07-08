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
import FormField from "@/components/FormField";

export default function AddressForm({ register, errors, disableInput = false }: ValidationFormProps) {
  return (
    <FieldSet className="w-full max-w-sm">
      <FieldLegend>Address Information</FieldLegend>
      <FieldDescription>
        We need your address to deliver your order.
      </FieldDescription>
      <FieldGroup>
         <FormField
                className=""
                id="register-street"
                label="Street Address"
                type="text"
                disabled={disableInput}
                register={register("streetAddress")}
                error={errors.streetAddress}
                required={true}
              ></FormField>
       
        <div className="grid grid-cols-2 gap-4">
         
             <FormField
                className=""
                id="register-city"
                label="City"
                type="text"
                placeholder="New York"
                disabled={disableInput}
                register={register("city")}
                error={errors.city}
                required={true}
              ></FormField>



           <FormField
                className=""
                id="register-postalcode"
                label="Postal Code"
                type="text"
                placeholder="80952"
                disabled={disableInput}
                register={register("postalCode")}
                error={errors.postalCode}
                required={true}
              ></FormField>


        </div>
      </FieldGroup>
    </FieldSet>
  );
}
