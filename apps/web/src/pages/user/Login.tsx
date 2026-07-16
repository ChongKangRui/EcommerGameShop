import { useForm, type FieldValues } from "react-hook-form";

import LoginForm from "../../components/auth/login/LoginForm";
import { Link } from "react-router";
import { Button } from "../../components/ui/button";
import { useLogin } from "@/hooks/userAuthMutation";
import { useState } from "react";
import {
  loginDataSchema,
  type LoginData,
} from "@ecom/shared/src/loginDataSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthProvider";
import { flashMessage_Failed } from "@/lib/flash";
import type { ApiError } from "@ecom/shared/src/type/api";
import { useCart } from "@/hooks/useCart";
import { useGuestCartStore } from "@/components/cart/GuestCartStore";
import type { UserLoginRespawn } from "@ecom/shared/src/type/user";

export default function Register() {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<LoginData>({
    resolver: zodResolver(loginDataSchema),
  });

  const navigate = useNavigate();
  const loginMutation = useLogin();
  const [disableInput, setDisableInput] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { setToken, setUser } = useAuth();
  const { migrateItem } = useCart();
  const { items } = useGuestCartStore();

  const handleLogin = (data: FieldValues) => {
    console.log("UserLoginInfo", data);

    setDisableInput(true);
    loginMutation.mutate(
      { ...data, rememberMe },
      {
        onSuccess: (res: UserLoginRespawn) => {
          //console.log(res.user);
          setToken(res.token);
          // put migrate cart item in between of setToken
          // but not yet grant the authentication state
          // prevent the cart items double fetch
          migrateItem(items);
          setUser(res.user);
          //migrateItem(items);
        },
        onError: (error: Error) => {
          console.log("Error", error);
          setDisableInput(false);
          flashMessage_Failed(error.message);
        },
      },
    );

  };

  const fillInCustomerCredential = ()=>{
     setValue("email", "abc@gmail.com", {shouldValidate: true});
     setValue("password", "abcABC123", {shouldValidate: true, shouldDirty: true});
    
  }

  const fillInAdminCredential = ()=>{
    setValue("email", "admin@gmail.com", {shouldValidate: true});
    setValue("password", "Admin12345", {shouldValidate: true, shouldDirty: true});
  }


  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-5xl px-4">
        {/* Title — hidden on mobile, visible on desktop */}
        <div className="block md:block text-center mb-5 md:-mt-15 md:mb-13">
          <Link className="text-5xl font-bitcount" to={"/"}>
            {"Redfield Gaming"}
          </Link>
          <h2 className="text-2xl font-bitcount mt-5">Login</h2>
        </div>

        <form onSubmit={handleSubmit((data) => handleLogin(data))}>
          {/* Two columns on desktop, single column on mobile */}
          <div className="flex flex-col md:flex-row md:gap-12 justify-center items-center">
            {/* User Form */}
            <div className="max-w-sm w-full md:w-1/2">
              <LoginForm
                register={register}
                errors={errors}
                disableInput={disableInput}
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex flex-col gap-5">
            <div className="text-center mt-10">
              <div className="flex items-center justify-center my-5 gap-3">
                <Switch id="rememberMe" onCheckedChange={setRememberMe} />
                <Label htmlFor="rememberMe">Remember Me</Label>
              </div>
              <Button className="cursor-pointer" type="submit">
                {loginMutation.isPending ? "Logging in..." : "Login"}
              </Button>
            </div>
            <div className="flex justify-center md:gap-5">
              <Button className="cursor-pointer bg-green-500" onClick={()=>{fillInCustomerCredential()}}>
                Fill customer demo
              </Button>
              <Button className="cursor-pointer bg-yellow-500" onClick={()=>{fillInAdminCredential()}}>
                Fill admin demo
              </Button>
            </div>
          </div>

          {/* error message */}
          {/* {loginMutation.isError && (
            <p className="text-center text-destructive mt-4">
              {loginMutation.error?.message || "Something went wrong"}
            </p>
          )} */}
        </form>
      </div>
    </div>
  );
}
