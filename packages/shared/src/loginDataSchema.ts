import { z } from "zod";

export const loginDataSchema = z
  .object({
   
    email: z
      .email("Please enter email address")
      .min(1, "Email is required"),
    password: z
      .string()
      .min(1, "Please enter password")
  })
  // .refine((data) => data.password === data.confirmPassword, {
  //   message: "Passwords do not match",
  //   path: ["confirmPassword"],
  // });

export type LoginData = z.infer<typeof loginDataSchema>;
