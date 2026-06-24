import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  passwordUpdateDataSchema,
  type PasswordData,
} from "@ecom/shared/src/profileUpdateDataSchema";

import { useForm, type FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePasswordUpdate } from "@/hooks/userAuth";
import { useNavigate } from "react-router";

export default function UpdatePasswordDialogue() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PasswordData>({
    resolver: zodResolver(passwordUpdateDataSchema),
  });

  const updatePasswordMutation = usePasswordUpdate();
  const navigate = useNavigate();

  const handleUpdate = (data: FieldValues) => {
    updatePasswordMutation.mutate(data, {
      onSuccess: () => {
        // navigate("/login");
        navigate("/profile");
      },
      onError: (error) => {
        console.log("showing error");
        console.log(error.message);
        // console.error(error.message);
      },
    });
  };

  const resetValue = (open: boolean) => {
    if (!open) {
      reset({
        oldPassword: "",
        newPassword: "",
      });
    }
  };

  return (
    <Dialog onOpenChange={resetValue}>
      <DialogTrigger>
        <Button className="cursor-pointer min-w-20">Update Password</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <form onSubmit={handleSubmit((data) => handleUpdate(data))}>
          <FieldGroup>
            <Field>
              <Label htmlFor="oldPassword">Old Password</Label>
              <Input
                id="oldPassword"
                type="password"
                disabled={updatePasswordMutation.isPending}
                {...register("oldPassword")}
              />
              {errors.oldPassword && (
                <p className="text-destructive text-sm mt-1">
                  {errors.oldPassword.message as string}
                </p>
              )}
            </Field>
            <Field>
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                {...register("newPassword")}
                disabled={updatePasswordMutation.isPending}
              />
              {errors.newPassword && (
                <p className="text-destructive text-sm mt-1">
                  {errors.newPassword.message as string}
                </p>
              )}
            </Field>
          </FieldGroup>
          <DialogFooter>
            <DialogClose>
              <Button
                variant="outline"
                className="cursor-pointer"
                disabled={updatePasswordMutation.isPending}
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              className="cursor-pointer"
              disabled={updatePasswordMutation.isPending}
            >
              Update
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
