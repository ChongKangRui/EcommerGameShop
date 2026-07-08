import { useForm } from "react-hook-form";

import {
  Field,
  FieldGroup,

  FieldLabel,

} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { type ValidationFormProps } from "@/lib/utils";
import FormField from "@/components/FormField";

import {
  type ProductTypeEnum
} from "@ecom/shared/src/type/product";

interface ProductInfoProps extends ValidationFormProps{
  setProductType: (type: ProductTypeEnum)=>void;
  defaultProductType: string
}


export default function ProductInfo({
  register,
  errors,
  disableInput = false,
  defaultProductType,
  setProductType
}: ProductInfoProps) {




  return (
    <FieldGroup className=" grid grid-cols-2 col-span-full">
      {/* product name */}
      <FormField
        className="col-span-2"
        id="product-name"
        label="Product name"
        type="text"
        placeholder=""
        disabled={disableInput}
        register={register("name")}
        error={errors.name}
        required={true}
      ></FormField>

      {/* Price */}
      <FormField
        className="col-span-2 md:col-span-1"
        id="product-price"
        label="Price"
        type="number"
        step={0.01}
        disabled={disableInput}
        register={register("price", { valueAsNumber: true })}
        error={errors.price}
        required={true}
        
      ></FormField>

      {/* discount percentage */}
      <FormField
        className="col-span-2 md:col-span-1"
        id="product-discount-percentage"
        label="Discount Percentage"
        type="number"
        placeholder=""
        disabled={disableInput}
        register={register("discount_percentage", { valueAsNumber: true })}
        error={errors.discount_percentage}
        required={false}
      ></FormField>

      {/* Product Type */}
      <Field className="col-span-2 md:col-span-2">
        <FieldLabel htmlFor="product-type">
          Product Type <span className="text-destructive">*</span>
        </FieldLabel>
        <Select
          defaultValue={defaultProductType}
           disabled={disableInput}
           onValueChange={(e) => {
             setProductType(e as ProductTypeEnum);
           }}
          {...register("type")}
        >
          <SelectTrigger id="product-type">
            <SelectValue></SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="switch">Switch</SelectItem>
            <SelectItem value="switch_2">Switch 2</SelectItem>
            <SelectItem value="ps4">PS4</SelectItem>
            <SelectItem value="ps5">PS5</SelectItem>
            <SelectItem value="xbox">Xbox</SelectItem>
          </SelectContent>
        </Select>
        {errors.type && (
          <p className="text-destructive text-sm mt-1">
            {errors.type.message as string}
          </p>
        )}
      </Field>

      {/* Date */}
      <FormField
        className="col-span-1"
        id="product-release-date"
        label="Release Date"
        type="date"
        placeholder=""
        disabled={disableInput}
        register={register("release_date")}
        error={errors.release_date}
        required={true}
      ></FormField>

       {/* Push to home page */}
      <FormField
        className="col-span-1 h-10"
        id="product-release-date"
        label="Mark as best selling"
        type="checkbox"
        placeholder=""
        disabled={disableInput}
        register={register("push_home_page")}
        error={errors.push_home_page}
        required={false}
      ></FormField>
    </FieldGroup>
  );
}
