import { Request, Response } from 'express';
import { CategoryService } from '../services/categoryService';

const categoryService = new CategoryService();

export class CategoryController {
  async create(req: Request, res: Response) {
    const category = await categoryService.create(req.body);
    
    res.status(201).json({
      message: 'Categoria criada com sucesso',
      statusCode: 201,
      data: category
    });
  }

  async update(req: Request, res: Response) {
    const category = await categoryService.update(
      req.params.id,
      req.body
    );
    
    res.json({
      message: 'Categoria atualizada com sucesso',
      statusCode: 200,
      data: category
    });
  }

  async list(req: Request, res: Response) {
    const categories = await categoryService.list();
    
    res.json({
      message: 'Categorias recuperadas com sucesso',
      statusCode: 200,
      data: categories
    });
  }

  async findById(req: Request, res: Response) {
    const category = await categoryService.findById(req.params.id);
    
    res.json({
      message: 'Categoria recuperada com sucesso',
      statusCode: 200,
      data: category
    });
  }

  async delete(req: Request, res: Response) {
    await categoryService.delete(req.params.id);
    
    res.json({
      message: 'Categoria desativada com sucesso',
      statusCode: 200
    });
  }
}
