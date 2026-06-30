import { useForm, type FieldValues, useFieldArray } from "react-hook-form";

import { Button } from "../../components/ui/button";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAddProduct } from "@/hooks/useProductMutation";

import { useState, useEffect } from "react";
import AddProductForm from "@/components/admin/product/add/AddProductForm";
import AddProductVariationForm from "@/components/admin/product/add/AddProductVariationForm";
import {
  productSchema,
  type ProductFormData,
} from "@ecom/shared/src/productSchema";
import { flashMessage_Success } from "@/lib/flash";

export default function AddProduct() {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      price: 0,
      type: "switch",
      release_date: "",
      discount_percentage: 0,
      
      variations: [
        {
          label: "",
          image: undefined,
          image_url: "",
          is_cover: true,
          stock: 0,
          price_offset: 0,
        }, // ← defaults here
      ],
    },
  });

  const productMutation = useAddProduct();
  //const [disableInput, setDisableInput] = useState(false);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "variations",
  });

  useEffect(() => {
    const hasCover = fields.some((field) => field.is_cover);
    if (!hasCover && fields.length > 0) {
      setValue("variations.0.is_cover", true, { shouldValidate: true });
    }
  }, [fields.length]);

  const setCover = (i: number) => {
    fields.forEach((_, index) => {
      setValue(`variations.${index}.is_cover`, i === index, {
        shouldValidate: true,
        shouldDirty: true,
      });
    });
    console.log(fields);
  };

  const setImage = (i: number, image: File|undefined) => {
     const oldUrl = fields[i]?.image_url;
      if (oldUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(oldUrl);
      }
    
    if (!image) {
      setValue(`variations.${i}.image`, undefined as any, { shouldValidate: true });
      setValue(`variations.${i}.image_url`, "", {
        shouldDirty: true,
      });
      //trigger(`variations.${i}.image`);

      return;
    }
    const url = URL.createObjectURL(image);

    setValue(`variations.${i}.image`, image, {
      shouldValidate: true,
    });
    setValue(`variations.${i}.image_url`, url, {
      shouldDirty: true,
    });

    console.log(url);
  };

  const getImage = (i: number): string => {
    const variation = fields[i];
 
    if (!variation) return "";

      
    if (variation.image_url) 
      return variation.image_url; 
 
    return "";
  };

  const addNewProductVariation = () => {
    append({
      label: "",
      image: undefined as unknown as File,
      image_url: "",
      is_cover: false,
      stock: 0,
      price_offset: 0,
    });
  };

  const removeProductVariation = async (i: number) => {
    //const isRemovingCover = fields[i].is_cover;
    remove(i);
  };

  const handleProductSubmittion = (data: FieldValues) => {
    //setDisableInput(true);

    console.log("Add Product ", data);
    productMutation.mutate(data, {
      onSuccess: (message: string) => {
        console.log(message);
        reset();
        flashMessage_Success(message);
      },
      onError: (error) => {
        console.log("showing error");
        console.log(error.message);
        // console.error(error.message);
      },
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-5xl">
        {/* Title — hidden on mobile, visible on desktop */}
        <div className="block text-center mb-5">
          <h2 className="text-2xl">Add Product</h2>
        </div>

        <form onSubmit={handleSubmit((data) => handleProductSubmittion(data))}>
          {/* Two columns on desktop, single column on mobile */}
          <div className="flex flex-col md:flex-row md:gap-12 justify-center items-center">
            {/* Product Form */}
            <div className="w-5/6 ms-auto md:ms-0 md:w-7/12 lg:w-8/12">
              {/* Product global input */}
              <AddProductForm
                register={register}
                errors={errors}
                disableInput={productMutation.isPending}
              ></AddProductForm>

              {/* Product variation form */}
              {fields.map((field, index) => (
                <AddProductVariationForm
                  key={field.id}
                  control={control}
                  register={register}
                  errors={errors}
                  index={index}
                  setCover={setCover}
                  setImage={setImage}
                  getImage={getImage}
                  removeProductVariation={removeProductVariation}
                  disableInput={productMutation.isPending}
                ></AddProductVariationForm>
              ))}
            </div>
          </div>

          {/* Submit and add new product variation*/}
          <div className="text-center mt-10 flex flex-col justify-center items-center md:flex-row md:gap-5 ">
            <Button
              className="cursor-pointer max-w-50"
              disabled={productMutation.isPending}
              onClick={() => addNewProductVariation()}
            >
              Add new product variation
            </Button>
            <Button
              className="cursor-pointer min-w-50"
              type="submit"
              disabled={productMutation.isPending}
            >
              {productMutation.isPending ? "Sending..." : "Send"}
            </Button>
          </div>

          {/* error message */}
          {productMutation.isError && (
            <p className="text-center text-destructive mt-4">
              {productMutation.error?.message || "Something went wrong"}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
