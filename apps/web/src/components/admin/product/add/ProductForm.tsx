import { useForm, type FieldValues, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import ProductInfoForm from "@/components/admin/product/add/ProductInfoForm";
import ProductVariations from "@/components/admin/product/add/ProductVariations";
import { PopupDialogue } from "@/components/PopupDialogue";
import {
  productSchema,
  type ProductFormData,
} from "@ecom/shared/src/productSchema";

import { type ProductTypeEnum } from "@ecom/shared/src/type/product";
import type { UseMutateFunction } from "@tanstack/react-query";
import { flashMessage_Failed, flashMessage_Success } from "@/lib/flash";

type ProductFormProps = {
  title: string;
  defaultValues?: ProductFormData;
  onSubmit: (data: ProductFormData) => void;
  isPending: boolean;
  isError: boolean;
  resetForm: boolean;
  errorMessage?: string;
  showDeleteButton?: boolean;
  onDeleteMutation?: UseMutateFunction<any, Error, void, unknown>;
  onDeleteCallback?: (message: string)=>void;
};
function getTodayDateString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
const defaultProductValues: ProductFormData = {
  name: "",
  price: 1,
  type: "switch",
  release_date: getTodayDateString(),
  push_home_page: false,
  description: "",
  discount_percentage: 0,
  variations: [
    {
      variation_id: "",
      label: "",
      image: undefined as unknown as File,
      image_url: "",
      is_cover: true,
      stock: 0,
      price_offset: 0,
    },
  ],
};
export default function ProductForm({
  title,
  defaultValues = defaultProductValues,
  onSubmit,
  isPending,
  isError,
  resetForm,
  errorMessage,
  showDeleteButton = false,
  onDeleteMutation,
  onDeleteCallback
}: ProductFormProps) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues,
  });

  const [disableDialogueButton, setDisableDialogueButton] = useState(false);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "variations",
  });

  const onDeleteFn = ()=>{
    if(onDeleteMutation){
    onDeleteMutation(undefined, {
            onSuccess: (res) => {
              if(onDeleteCallback){
                onDeleteCallback(res.message);
              }
              setDisableDialogueButton(true);
              
            },
            onError: (error) => {
              flashMessage_Failed(error.message);
              setDisableDialogueButton(false);
            },
          })
        }
    setDisableDialogueButton(true);
  }

  /////////////////////////////////////////////////////////////////////////
  //set product variation 0 as cover is the selected cover variation was deleted
  /////////////////////////////////////////////////////////////////////////
  useEffect(() => {
    const hasCover = fields.some((field) => field.is_cover);
    if (!hasCover && fields.length > 0) {
      setValue("variations.0.is_cover", true, { shouldValidate: true });
    }
  }, [fields.length]);

  /////////////////////////////////////////////////////////////////////////
  //reset the form
  /////////////////////////////////////////////////////////////////////////
  useEffect(() => {
    if (resetForm) reset();
  }, [resetForm]);

  /////////////////////////////////////////////////////////////////////////
  //Button will not register by react-hook-form
  //not to mention setCover isn't a must for fill in
  /////////////////////////////////////////////////////////////////////////
  const setCover = (i: number) => {
    fields.forEach((_, index) => {
      setValue(`variations.${index}.is_cover`, i === index, {
        shouldValidate: true,
        shouldDirty: true,
      });
    });
  };

  /////////////////////////////////////////////////////////////////////////
  //react-hook-form not support select by defaults
  /////////////////////////////////////////////////////////////////////////
  const setProductType = (type: ProductTypeEnum) => {
    setValue(`type`, type, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  /////////////////////////////////////////////////////////////////////////
  //setImage will handle the generation of image url to show the selected image for admin
  /////////////////////////////////////////////////////////////////////////
  const setImage = (i: number, image: File | undefined) => {
    const oldUrl = fields[i]?.image_url;
    if (oldUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(oldUrl);
    }
    if (!image) {
      setValue(`variations.${i}.image`, undefined as any, {
        shouldValidate: true,
        shouldDirty: true,
      });
      setValue(`variations.${i}.image_url`, "", { shouldDirty: true });
      return;
    }
    const url = URL.createObjectURL(image);
    setValue(`variations.${i}.image`, image, { shouldValidate: true });
    setValue(`variations.${i}.image_url`, url, { shouldDirty: true });
  };


  const getImage = (i: number): string => {
    const variation = fields[i];
    if (!variation) return "";
    return variation.image_url ?? "";
  };


  const addNewProductVariation = () => {
    append({
      variation_id: "",
      label: "",
      image: undefined as unknown as File,
      image_url: "",
      is_cover: false,
      stock: 0,
      price_offset: 0,
    });
  };
  
  const removeProductVariation = (i: number) => {
    remove(i);
  };
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-5xl">
        <div className="block text-center mb-5">
          <h2 className="text-2xl">{title}</h2>
        </div>
        <form
          onSubmit={handleSubmit(onSubmit, (errors) => {
            console.log("Form validation error: ", errors);
          })}
        >
          <div className="flex flex-col md:flex-row md:gap-12 justify-center items-center">
            <div className="w-5/6 ms-auto md:ms-0 md:w-7/12 lg:w-8/12">
              <ProductInfoForm
                register={register}
                errors={errors}
                disableInput={isPending}
                defaultProductType={watch("type")}
                setProductType={setProductType}
              />
              {fields.map((field, index) => (
                <ProductVariations
                  key={field.id}
                  control={control}
                  register={register}
                  errors={errors}
                  index={index}
                  setCover={setCover}
                  setImage={setImage}
                  getImage={getImage}
                  removeProductVariation={removeProductVariation}
                  disableInput={isPending}
                />
              ))}
            </div>
          </div>
          <div className="text-center mt-10 flex flex-col justify-center items-center md:flex-row md:gap-5">
            <Button
              type="button"
              className="cursor-pointer max-w-50"
              disabled={isPending}
              onClick={addNewProductVariation}
            >
              Add new product variation
            </Button>
            {showDeleteButton && (
              <PopupDialogue
                title="Warning"
                trigger="Delete Product"
                content="You are performing a permanent delete of the product, are you sure you wanna continue?"
                triggerClassName="cursor-pointer min-w-50 bg-red-600"
                onConfirm={onDeleteFn}
                disableButton={disableDialogueButton}
              ></PopupDialogue>
            )}
            <Button
              type="submit"
              className="cursor-pointer min-w-50"
              disabled={isPending}
            >
              {isPending ? "Sending..." : "Submit"}
            </Button>
          </div>
          {/* {isError && (
             <p className="text-center text-destructive mt-4">
               {errorMessage ?? "Something went wrong"}
             </p>
           )} */}
        </form>
      </div>
    </div>
  );
}
