
import { z } from "zod";

export const createStudentSchema = z.object({
  name: z.string().trim().min(2).max(100),
  age: z.number().int().min(1).max(120).optional(),
  gender: z.enum(["Male", "Female", "Other"]).optional(),
  email: z.string().trim().email().max(255),
  phoneNo: z.string().trim().max(20).optional(),
  address: z.string().trim().max(500).optional(),
});

export const updateStudentSchema = createStudentSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export type CreateStudentInput = z.infer<
  typeof createStudentSchema
>;

export type UpdateStudentInput = z.infer<
  typeof updateStudentSchema
>;
