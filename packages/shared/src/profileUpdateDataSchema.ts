import { z } from "zod";

export const userInfoUpdateDataSchema = z
  .object({
    firstName: z
      .string()
      .min(1, "First name is required")
      .max(100, "First name must be under 100 characters"),
    lastName: z
      .string()
      .min(1, "Last name is requiredd")
      .max(100, "Last name must be under 100 characters"),
    email: z
      .email("Please enter a valid email address")
      .min(1, "Email is required"),
    address: z
      .string()
      .min(1, "address is required")
   
  })


export const passwordUpdateDataSchema = z
  .object({
    oldPassword: z.string().min(1, "Old password can't be empty"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters")
      .regex(/[a-z]/, "New password must contain at least one lowercase letter")
      .regex(/[A-Z]/, "New password must contain at least one uppercase letter")
      .regex(/[0-9]/, "New password must contain at least one number"),
   
  }).refine((data) => data.oldPassword !== data.newPassword, {
    message: "New password must be different from old password",
    path: ["newPassword"],
  });

  // .refine((data) => data.password === data.confirmPassword, {
  //   message: "Passwords do not match",
  //   path: ["confirmPassword"],
  // });

export type UserData = z.infer<typeof userInfoUpdateDataSchema>;
export type PasswordData = z.infer<typeof passwordUpdateDataSchema>;
