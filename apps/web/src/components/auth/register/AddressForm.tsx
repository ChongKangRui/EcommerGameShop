import { useForm } from 'react-hook-form';

import { Field, FieldGroup,FieldDescription, FieldLabel, FieldLegend,
  FieldSet, } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { type RegisterFormProps } from '@/lib/utils';



export default function AddressForm({register, errors}:RegisterFormProps ){


    return(
     
    <FieldSet className="w-full max-w-sm">
      <FieldLegend>Address Information</FieldLegend>
      <FieldDescription>
        We need your address to deliver your order.
      </FieldDescription>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="street">Street Address</FieldLabel>
          <Input id="street" type="text" placeholder="123 Main St" 
         {...register("address", { required: "Address is required" })} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="city">City</FieldLabel>
            <Input id="city" type="text" placeholder="New York"
             {...register("city", { required: "City is required" })}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="zip">Postal Code</FieldLabel>
            <Input id="zip" type="text" placeholder="90502" 
            {...register("zip", { required: "Postal code is required" })}
            />
          </Field>
        </div>
      </FieldGroup>
    </FieldSet>
  
    )
} 