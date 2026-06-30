import { useForm, type FieldValues } from "react-hook-form";

import UserForm from "../../components/auth/register/UserForm";
import AddressForm from "../../components/auth/register/AddressForm";
import { Link } from "react-router";
import { Button } from "../../components/ui/button";
import { registerDataSchema, type RegisterData } from "@ecom/shared/src/registerDataSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRegister } from "@/hooks/userAuthMutation";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import TermOfService from "@/components/auth/register/TermOfService";

export default function Register() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterData>({
    resolver: zodResolver(registerDataSchema),
  });

   const navigate = useNavigate();
   const registerMutation = useRegister();
   const [disableInput, setDisableInput] = useState(false);

   const handleRegistration = (data: FieldValues)=>{
      console.log("UserRegisterInfo", data);
      setDisableInput(true);
       registerMutation.mutate(data, {
      onSuccess: () => {
        navigate("/login");
      },
      onError: (error) => {
        console.log('showing error');
        console.log(error.message);
       // console.error(error.message);
        setDisableInput(false);
      },
    });
      
    }

  return (
   <div className="flex items-center justify-center min-h-screen">
  <div className="w-full max-w-5xl px-4">

    {/* Title — hidden on mobile, visible on desktop */}
    <div className="block md:block text-center mb-5 md:-mt-15 md:mb-13">
     <Link className="text-5xl font-bitcount" to={"/"}>{"Redfield Gaming"}</Link>
      <h2 className="text-2xl font-bitcount mt-5">Registration</h2>
    </div>

    <form onSubmit={handleSubmit((data) => handleRegistration(data))}>

      {/* Two columns on desktop, single column on mobile */}
      <div className="flex flex-col md:flex-row md:gap-12 justify-center items-center">

        {/* User Form */}
        <div className="max-w-sm w-full md:w-1/2">
          <UserForm register={register} errors={errors} disableInput={disableInput}/>
        </div>

        {/* Address Form */}
        <div className="max-w-sm w-full md:w-1/2 mt-6 md:mt-0">
          <AddressForm register={register} errors={errors} disableInput={disableInput} />
        </div>

      </div>

      {/* Submit */}
       <div className="text-center mt-10">
  <p className="text-[12px] my-2">By continuing, you agree to our <TermOfService/></p>

        <Button className="cursor-pointer" type="submit" disabled={registerMutation.isPending}>
           {registerMutation.isPending ? "Registering..." : "Register"}
        </Button>
      </div>

{/* error message */}
      {registerMutation.isError && (
            <p className="text-center text-destructive mt-4">
              {registerMutation.error?.message || "Something went wrong"}
            </p>
          )}

    </form>
  </div>
</div>
  );
}
