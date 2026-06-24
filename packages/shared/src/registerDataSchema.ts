import { z } from "zod";

export const registerDataSchema = z
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
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
   // confirmPassword: z.string().min(1, "Please confirm your password"),
    streetAddress: z
      .string()
      .min(1, "Street address is required")
      .max(100, "Street address must be under 100 characters"),
    city: z
      .string()
      .min(1, "City is required")
      .max(168, "City must be under 168 characters"),
    postalCode: z
      .string()
      .min(1, "Postal code is required")
      .min(3, "Postal code must be at least 3 characters")
      .max(12, "Postal code must be under 12 characters"),
  })
  // .refine((data) => data.password === data.confirmPassword, {
  //   message: "Passwords do not match",
  //   path: ["confirmPassword"],
  // });

export type RegisterData = z.infer<typeof registerDataSchema>;
