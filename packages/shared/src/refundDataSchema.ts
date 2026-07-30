import { z } from "zod";
import { refundUpdateOptions } from "./type/refund";

export const refundDataSchema = z
  .object({
    firstName: z
          .string()
          .min(1, "You are require to explain the reason of refund.")
          .max(1000, "Your refund reason is too long."),
 
  })

export type RefundData = z.infer<typeof refundDataSchema>;

export const refundUpdateEnumSchema = z.enum(refundUpdateOptions);