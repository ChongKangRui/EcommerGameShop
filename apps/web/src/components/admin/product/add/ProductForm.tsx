
 import { useForm, type FieldValues, useFieldArray } from "react-hook-form";
 import { Button } from "@/components/ui/button";
 import { zodResolver } from "@hookform/resolvers/zod";
 import { useEffect } from "react";
 import ProductInfo from "@/components/admin/product/add/ProductInfo";
 import ProductVariations from "@/components/admin/product/add/ProductVariations";
 import { AlertDangerousDialogue } from "@/components/AlertDangerous";
 import {
   productSchema,
   type ProductFormData,
   
 } from "@ecom/shared/src/productSchema";

import {
  type ProductTypeEnum
} from "@ecom/shared/src/type/product";

 type ProductFormProps = {
   title: string;
   defaultValues?: ProductFormData;
   onSubmit: (data: ProductFormData) => void;
   isPending: boolean;
   isError: boolean;
   resetForm:boolean,
   errorMessage?: string;
   showDeleteButton?: boolean;
   onDelete?: () => void;
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
   price: 0,
   type: "switch",
   release_date: getTodayDateString(),
   push_home_page: false,
   discount_percentage: 0,
   variations: [
     {
      variation_id:"",
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
   onDelete,
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
   // reset the form
   useEffect(() => {
   if (resetForm) reset();
 }, [resetForm]);
   const setCover = (i: number) => {
     fields.forEach((_, index) => {
       setValue(`variations.${index}.is_cover`, i === index, {
         shouldValidate: true,
         shouldDirty: true,
       });
     });
   };

   const setProductType = (type: ProductTypeEnum)=>{
    setValue(`type`, type , {
         shouldValidate: true,
         shouldDirty: true,
       });
   }

   const setImage = (i: number, image: File | undefined) => {
     const oldUrl = fields[i]?.image_url;
     if (oldUrl?.startsWith("blob:")) {
       URL.revokeObjectURL(oldUrl);
     }
     if (!image) {
       setValue(`variations.${i}.image`, undefined as any, { shouldValidate: true });
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
      variation_id:"",
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
         <form onSubmit={handleSubmit(onSubmit, (errors)=>{console.log("Form validation error: ", errors)})}>
           <div className="flex flex-col md:flex-row md:gap-12 justify-center items-center">
             <div className="w-5/6 ms-auto md:ms-0 md:w-7/12 lg:w-8/12">
               <ProductInfo
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
               <AlertDangerousDialogue
               title="Warning"
               triggerText="Delete Product"
                 content="You are performing a permanent delete of the product, are you sure you wanna continue?"
                 triggerClassName="cursor-pointer min-w-50 bg-red-600"
                 onConfirm={onDelete ?? (() => {})}
               >
               </AlertDangerousDialogue>
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
///////////////////////////////////////

// import { useForm, type FieldValues, useFieldArray } from "react-hook-form";
// import { Button } from "@/components/ui/button";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useEffect } from "react";
// import ProductInfo from "@/components/admin/product/add/ProductInfo";
// import ProductVariations from "@/components/admin/product/add/ProductVariations";
// import { AlertDangerousDialogue } from "@/components/AlertDangerous";
// import {
//   productSchema,
//   type ProductFormData,
// } from "@ecom/shared/src/productSchema";
// import type{ZodTypeAny } from "zod"

// type ProductFormProps = {
//   title: string;
//   schema: ZodTypeAny;
//   defaultValues?: ProductFormData;
//   onSubmit: (data: ProductFormData) => void;
//   isPending: boolean;
//   isError: boolean;
//   resetForm:boolean,
//   errorMessage?: string;
//   showDeleteButton?: boolean;
//   onDelete?: () => void;

// };

// function getTodayDateString(): string {
//   const today = new Date();
//   const year = today.getFullYear();
//   const month = String(today.getMonth() + 1).padStart(2, "0");
//   const day = String(today.getDate()).padStart(2, "0");
//   return `${year}-${month}-${day}`;
// }

// const defaultProductValues: ProductFormData = {
//   name: "",
//   price: 0,
//   type: "switch",
//   release_date: getTodayDateString(),
//   discount_percentage: 0,
//   variations: [
//     {
//       label: "",
//       variation_id: "",
//       image: undefined as unknown as File,
//       image_url: "",
//       is_cover: true,
//       stock: 0,
//       price_offset: 0,
//     },
//   ],
// };

// export default function ProductForm({
//   title,
//   schema,
//   defaultValues = defaultProductValues,
//   onSubmit,
//   isPending,
//   isError,
//   resetForm,
//   errorMessage,
//   showDeleteButton = false,
//   onDelete,

// }: ProductFormProps) {

//   const {
//     register,
//     handleSubmit,
//     control,
//     setValue,
//     reset,
//     watch,
//     formState: { errors },
//   } = useForm<ProductFormData>({
//     resolver: zodResolver(schema as any),
//     defaultValues: defaultValues as any,
//   });

//   const { fields, append, remove } = useFieldArray({
//     control,
//     name: "variations",
//   });

//   useEffect(() => {
//     const hasCover = fields.some((field) => field.is_cover);
//     if (!hasCover && fields.length > 0) {
//       setValue("variations.0.is_cover", true, { shouldValidate: true });
//     }
//   }, [fields.length]);

//   // reset the form
//   useEffect(() => {
//   if (resetForm) reset();
// }, [resetForm]);

//   const setCover = (i: number) => {
//     fields.forEach((_, index) => {
//       setValue(`variations.${index}.is_cover`, i === index, {
//         shouldValidate: true,
//         shouldDirty: true,
//       });
//     });
//   };

//   const setImage = (i: number, image: File | undefined) => {
//     const oldUrl = fields[i]?.image_url;
//     if (oldUrl?.startsWith("blob:")) {
//       URL.revokeObjectURL(oldUrl);
//     }

//     if (!image) {
//       setValue(`variations.${i}.image`, undefined as any, { shouldValidate: true });
//       setValue(`variations.${i}.image_url`, "", { shouldDirty: true });
//       return;
//     }

//     const url = URL.createObjectURL(image);
//     setValue(`variations.${i}.image`, image, { shouldValidate: true });
//     setValue(`variations.${i}.image_url`, url, { shouldDirty: true });
//   };

//   const getImage = (i: number): string => {
//     const variation = fields[i];
//     if (!variation) return "";
//     return variation.image_url ?? "";
//   };

//   const addNewProductVariation = () => {
//     append({
//       label: "",
//       image: undefined as unknown as File,
//       image_url: "",
//       is_cover: false,
//       stock: 0,
//       price_offset: 0,
//     });
//   };

//   const removeProductVariation = (i: number) => {
//     remove(i);
//   };

//   return (
//     <div className="flex items-center justify-center min-h-screen">
//       <div className="w-full max-w-5xl">
//         <div className="block text-center mb-5">
//           <h2 className="text-2xl">{title}</h2>
//         </div>

//         <form onSubmit={handleSubmit(onSubmit)}>
//           <div className="flex flex-col md:flex-row md:gap-12 justify-center items-center">
//             <div className="w-5/6 ms-auto md:ms-0 md:w-7/12 lg:w-8/12">
//               <ProductInfo
//                 register={register}
//                 errors={errors}
//                 disableInput={isPending}
//                 defaultProductType={watch("type")}
//               />

//               {fields.map((field, index) => (
//                 <ProductVariations
//                   key={field.id}
//                   control={control}
//                   register={register}
//                   errors={errors}
//                   index={index}
//                   setCover={setCover}
//                   setImage={setImage}
//                   getImage={getImage}
//                   removeProductVariation={removeProductVariation}
//                   disableInput={isPending}
//                 />
//               ))}
//             </div>
//           </div>

//           <div className="text-center mt-10 flex flex-col justify-center items-center md:flex-row md:gap-5">
//             <Button
//               type="button"
//               className="cursor-pointer max-w-50"
//               disabled={isPending}
//               onClick={addNewProductVariation}
//             >
//               Add new product variation
//             </Button>

//             {showDeleteButton && (
//               <AlertDangerousDialogue
//               title="Warning"
//               triggerText="Delete Product"
//                 content="You are performing a permanent delete of the product, are you sure you wanna continue?"
//                 triggerClassName="cursor-pointer min-w-50 bg-red-600"
//                 onConfirm={onDelete ?? (() => {})}
//               >
//               </AlertDangerousDialogue>
//             )}

//             <Button
//               type="submit"
//               className="cursor-pointer min-w-50"
//               disabled={isPending}
//             >
//               {isPending ? "Sending..." : "Submit"}
//             </Button>
//           </div>

//           {isError && (
//             <p className="text-center text-destructive mt-4">
//               {errorMessage ?? "Something went wrong"}
//             </p>
//           )}
//         </form>
//       </div>
//     </div>
//   );
// }