import { z } from "zod";

export const createStudySetSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  subject: z.string().max(100).optional(),
  sourceText: z
    .string()
    .min(100, "Please add at least 100 characters of study material"),
});

export const generateContentSchema = z.object({
  studySetId: z.string().uuid(),
});

export const chatMessageSchema = z.object({
  studySetId: z.string().uuid(),
  message: z.string().min(1).max(4000),
});

export const visualizeConceptSchema = z.object({
  studySetId: z.string().uuid(),
  concept: z.string().min(1).max(500),
  userInstruction: z.string().max(4000).optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signupSchema = loginSchema.extend({
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});
