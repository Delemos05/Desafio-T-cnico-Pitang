import { PrismaClient } from '@prisma/client';
import { CreateCategoryInput, UpdateCategoryInput } from '../schemas/solicitation';
import { ValidationError, NotFoundError } from '../utils/errors';

const prisma = new PrismaClient();

export class CategoryService {
  async create(data: CreateCategoryInput) {
    const existingCategory = await prisma.category.findUnique({
      where: { name: data.name }
    });

    if (existingCategory) {
      throw new ValidationError('Categoria já existe');
    }

    return prisma.category.create({
      data
    });
  }

  async update(id: string, data: UpdateCategoryInput) {
    const category = await prisma.category.findUnique({
      where: { id }
    });

    if (!category) {
      throw new NotFoundError('Categoria não encontrada');
    }

    if (data.name) {
      const existingCategory = await prisma.category.findUnique({
        where: { name: data.name }
      });

      if (existingCategory && existingCategory.id !== id) {
        throw new ValidationError('Categoria com este nome já existe');
      }
    }

    return prisma.category.update({
      where: { id },
      data
    });
  }

  async list() {
    return prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });
  }

  async findById(id: string) {
    const category = await prisma.category.findUnique({
      where: { id }
    });

    if (!category) {
      throw new NotFoundError('Categoria não encontrada');
    }

    return category;
  }

  async delete(id: string) {
    const category = await prisma.category.findUnique({
      where: { id }
    });

    if (!category) {
      throw new NotFoundError('Categoria não encontrada');
    }

    return prisma.category.update({
      where: { id },
      data: { isActive: false }
    });
  }
}
