import { email, z } from "zod";

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
  rememberMe: z.boolean().optional(),
});

export const registerSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  email: z.email(),
  password: z.string().min(6, "Password minimal 6 karakter"),
});
