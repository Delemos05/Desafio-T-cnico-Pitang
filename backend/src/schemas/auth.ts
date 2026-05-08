import { z } from 'zod';

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token obrigatório')
});

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha obrigatória')
});

export const createUserSchema = z.object({
  email: z.string().email('Email inválido'),
  name: z.string().min(1, 'Nome obrigatório'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  role: z.enum(['EMPLOYEE', 'MANAGER', 'FINANCE', 'ADMIN'], {
    errorMap: () => ({ message: 'Role inválido' })
  })
});

export type LoginInput = z.infer<typeof loginSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type RefreshInput = z.infer<typeof refreshSchema>;
