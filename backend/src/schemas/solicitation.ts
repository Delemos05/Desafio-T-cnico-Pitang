import { z } from 'zod';

export const createSolicitationSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  amount: z.number().positive('Valor deve ser positivo'),
  date: z.string().min(1, 'Data é obrigatória'),
  categoryId: z.string().min(1, 'Categoria é obrigatória'),
  justification: z.string().optional(),
});

export const updateSolicitationSchema = createSolicitationSchema.partial();

export const approveRejectSchema = z.object({
  observation: z.string().min(1, 'Observação obrigatória')
});

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Nome obrigatório'),
  description: z.string().optional()
});

export const updateCategorySchema = createCategorySchema.partial();

export type CreateSolicitationInput = z.infer<typeof createSolicitationSchema>;
export type UpdateSolicitationInput = z.infer<typeof updateSolicitationSchema>;
export type ApproveRejectInput = z.infer<typeof approveRejectSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
