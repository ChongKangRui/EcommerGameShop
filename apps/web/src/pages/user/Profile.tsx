import { useForm, type FieldValues } from "react-hook-form";

import { Link } from "react-router";
import { Button } from "../../components/ui/button";
import {
  userInfoUpdateDataSchema,
  type UserData,
} from "@ecom/shared/src/profileUpdateDataSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useProfileUpdate } from "@/hooks/userAuthMutation";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

import { useAuth } from "@/context/AuthProvider";
import UserProfile from "@/components/user/UserProfile";

import UpdatePasswordDialogue from "@/components/user/UpdatePasswordDialogue";
import { flashMessage_Failed, flashMessage_Success } from "@/lib/flash";

export default function Profile() {
  const { user, logout } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UserData>({
    resolver: zodResolver(userInfoUpdateDataSchema),
    defaultValues: {
      firstName: user?.first_name,
      lastName: user?.last_name,
      email: user?.email,
      address: user?.address,
    },
  });

  const cancelEdit = () => {
    reset({
      firstName: user?.first_name,
      lastName: user?.last_name,
      email: user?.email,
      address: user?.address,
    });
    setIsEditing(false);
  };

  const profileUpdateMutation = useProfileUpdate();

  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  const handleUpdate = (data: FieldValues) => {
    setIsEditing(false);
    profileUpdateMutation.mutate(data, {
      onSuccess: () => {
        flashMessage_Success("Profile Update Success");
       
        // navigate("/login");
        //navigate("/profile");
      },
      onError: (error) => {
        console.log("showing error");
        console.log(error.message);
        // console.error(error.message);
        setIsEditing(false);
         flashMessage_Failed(error.message);
      },
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-5xl px-4">
        {/* Title — hidden on mobile, visible on desktop */}
        <div className="block md:block text-center mb-5 md:-mt-15 md:mb-13">
          <Link className="text-5xl font-bitcount" to={"/"}>
            {"Redfield Gaming"}
          </Link>
          <h2 className="text-2xl font-bitcount mt-5">Profile</h2>
        </div>

        <form onSubmit={handleSubmit((data) => handleUpdate(data))}>
          {/* Two columns on desktop, single column on mobile */}
          <div className="flex flex-col md:flex-row md:gap-12 justify-center items-center">
            {/* User Form */}
            <div className="max-w-sm w-full md:w-1/2">
              <UserProfile
                register={register}
                errors={errors}
                disableInput={!isEditing}
              />
            </div>
          </div>

          {/* Submit */}
          <div className="text-center mt-10">
            {isEditing && (
              <div className="flex flex-row justify-center gap-5">
                <Button
                  className="cursor-pointer"
                  disabled={profileUpdateMutation.isPending}
                  onClick={cancelEdit}
                >
                  Cancel
                </Button>
                <Button
                  className="cursor-pointer"
                  type="submit"
                  disabled={profileUpdateMutation.isPending}
                >
                  Update
                </Button>
              </div>
            )}
          </div>
        </form>
        {!isEditing && (
          <div className="flex flex-row justify-center gap-5">
            <Button
              className="cursor-pointer min-w-20"
              type="submit"
              disabled={profileUpdateMutation.isPending}
              onClick={() => setIsEditing(true)}
            >
              Edit
            </Button>
            <UpdatePasswordDialogue />
            <Button
              className="cursor-pointer min-w-20 bg-red-600 text-black"
              type="submit"
              disabled={profileUpdateMutation.isPending}
              onClick={() => logout()}
            >
              Log out
            </Button>
          </div>
        )}

        {/* error message */}
        {profileUpdateMutation.isError && (
          <p className="text-center text-destructive mt-4">
            {profileUpdateMutation.error?.message || "Something went wrong"}
          </p>
        )}
      </div>
    </div>
  );
}
