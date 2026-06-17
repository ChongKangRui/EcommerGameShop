import { useForm } from "react-hook-form";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";


import UserForm from "@/components/auth/register/UserForm";
import AddressForm from "@/components/auth/register/Addressform";

export default function Register() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-sm">
        <h1 className="text-center -mt-50 mb-10 text-5xl font-bitcount">
          Redfield Gaming
        </h1>
        <h1 className="text-center mb-10 text-2xl">Registration</h1>
        <form onSubmit={handleSubmit((data) => console.log(data))}>
          <Carousel
            className=" md:w-full"
            opts={{
              watchDrag: false,
            }}
          >
            {/* User Information */}
            <CarouselContent>
              <CarouselItem key={1}>
                <div className="">
                  <UserForm register={register} errors={errors}></UserForm>
                </div>
              </CarouselItem>

              {/* Address information */}
              <CarouselItem key={2}>
                <div className="">
                  <AddressForm
                    register={register}
                    errors={errors}
                  ></AddressForm>
                </div>
              </CarouselItem>
            </CarouselContent>

            {/* Submit, left and right arrow */}
            <div className="flex justify-around translate-y-40 gap-30">
              <CarouselPrevious className="translate-none static disabled:opacity-0 disabled:pointer-events-none" />
              <button type="submit">Submit</button>
              <CarouselNext className="translate-none static disabled:opacity-0 disabled:pointer-events-none" />
            </div>
          </Carousel>
        </form>
      </div>
    </div>
  );
}
