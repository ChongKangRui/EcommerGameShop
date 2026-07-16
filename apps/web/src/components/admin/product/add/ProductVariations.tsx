import { useForm, type Control } from "react-hook-form";

import {
  Field,
  FieldGroup,
  FieldDescription,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";

import { Button } from "../../../ui/button";

import { Heading1, Trash2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { type ValidationFormProps } from "@/lib/utils";
import { type UseFormWatch } from "react-hook-form";

import { type ProductVariationData } from "@ecom/shared/src/productSchema";
import { type ProductFormData } from "@ecom/shared/src/productSchema";
import { type FieldErrors } from "react-hook-form";
import FormField from "@/components/FormField";
import { ImagePlus } from "lucide-react";
import { useWatch } from "react-hook-form";

interface ProductVariationProps extends ValidationFormProps {
  control: Control<ProductFormData>;
  index: number;
  setCover: (index: number) => void;
  setImage: (index: number, f: File | undefined) => void;
  getImage: (index: number) => string;
  removeProductVariation: (index: number) => void;
}

export default function ProductVariations({
  register,
  control,
  errors,
  index,
  setCover,
  setImage,
  removeProductVariation,
  disableInput = false,
}: ProductVariationProps) {
  const variationErrors = errors.variations as
    | FieldErrors<ProductVariationData>[]
    | undefined;

  const isCover = useWatch({
    control,
    name: `variations.${index}.is_cover`,
  });

  const image_url = useWatch({
    control,
    name: `variations.${index}.image_url`,
  });

  return (
    <FieldGroup className="grid grid-cols-2 col-span-full">
      <hr className="mt-10 col-span-full" />
      <div className="flex justify-between col-span-full">
        <h2 className="text-2xl">Product Variation {index + 1}</h2>
        {index !== 0 && (
          <Trash2
            className="text-red-600 cursor-pointer"
            onClick={() => removeProductVariation(index)}
          ></Trash2>
        )}
      </div>

      {/* label */}
      <FormField
        className="col-span-2"
        id="product-variation-label"
        label="Label"
        type="text"
        placeholder=""
        disabled={disableInput}
        register={register(`variations.${index}.label`)}
        error={variationErrors?.[index]?.label}
        required={false}
      ></FormField>

      {/* Stock */}
      <FormField
        className="col-span-2 md:col-span-1"
        id="product-variation-stock"
        label="Stock"
        type="number"
        disabled={disableInput}
        register={register(`variations.${index}.stock`, {
          valueAsNumber: true,
        })}
        error={variationErrors?.[index]?.stock}
        required={true}
      />


      <Field className="col-span-2 md:col-span-1">
        <FieldLabel htmlFor={`picture-${index}`}>
          Picture <span className="text-destructive">*</span>
        </FieldLabel>

        {/* Hidden real input after image */}
        <input
          id={`picture-${index}`}
          type="file"
          disabled={disableInput}
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setImage(index, file);
          }}
        />

        {/* Custom clickable image input label, bind with htmlFor */}
        <label htmlFor={`picture-${index}`} className="cursor-pointer block">
          {image_url ? (
            <img
              src={image_url}
              alt={`variation ${index} preview`}
              className="rounded-xl border"
            />
          ) : (
            <div className="rounded border-2 border-dashed flex flex-col items-center justify-center gap-1 bg-muted hover:bg-muted/70 transition">
              <ImagePlus className="" />
              <span className="text-xs text-muted-foreground">
                Upload Image
              </span>
            </div>
          )}
        </label>

        {variationErrors?.[index]?.image && (
          <p className="text-destructive text-sm mt-1">
            {variationErrors?.[index]?.image?.message as string}
          </p>
        )}
      </Field>

      {/* Price Offset */}
      <FormField
        className="col-span-2 md:col-span-1"
        id="product-variation-price-offset"
        label="Price Offset"
        type="number"
        step={0.01}
        disabled={disableInput}
        register={register(`variations.${index}.price_offset`, {
          valueAsNumber: true,
        })}
        error={variationErrors?.[index]?.price_offset}
        required={true}
      />

      {/* Is cover button */}
      <Field className="col-span-2 md:col-span-1">
        <FieldLabel htmlFor="isCover">Is Cover?</FieldLabel>
        <Button
          type="button"
          id="isCover"
          disabled={disableInput || isCover}
          onClick={() => setCover(index)}
        >
          {isCover ? "Is cover!" : "Set As Cover"}
        </Button>

        {variationErrors?.[index]?.is_cover && (
          <p className="text-destructive text-sm mt-1">
            {variationErrors?.[index]?.is_cover.message as string}
          </p>
        )}
      </Field>
    </FieldGroup>
  );
}
