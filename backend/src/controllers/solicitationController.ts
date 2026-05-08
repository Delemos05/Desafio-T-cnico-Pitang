import { Request, Response } from 'express';
import { SolicitationService } from '../services/solicitationService';
import { AuthRequest, UserRole } from '../types';

const solicitationService = new SolicitationService();

export class SolicitationController {
  async create(req: AuthRequest, res: Response) {
    const solicitation = await solicitationService.create(
      req.body,
      req.user!.id
    );
    
    res.status(201).json({
      message: 'Solicitação criada com sucesso',
      statusCode: 201,
      data: solicitation
    });
  }

  async update(req: AuthRequest, res: Response) {
    const solicitation = await solicitationService.update(
      req.params.id,
      req.body,
      req.user!.id
    );
    
    res.json({
      message: 'Solicitação atualizada com sucesso',
      statusCode: 200,
      data: solicitation
    });
  }

  async list(req: AuthRequest, res: Response) {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    
    // Extrai filtros da query string
    const filters = {
      status: req.query.status as string,
      categoryId: req.query.categoryId as string,
      userId: req.query.userId as string,
      search: req.query.search as string,
      sortBy: req.query.sortBy as 'createdAt' | 'amount' | 'title',
      sortOrder: req.query.sortOrder as 'asc' | 'desc'
    };
    
    const result = await solicitationService.list(
      req.user!.role,
      req.user!.id,
      page,
      limit,
      filters
    );
    
    res.json({
      message: 'Solicitações listadas com sucesso',
      statusCode: 200,
      data: result
    });
  }

  async findById(req: AuthRequest, res: Response) {
    const solicitation = await solicitationService.findById(
      req.params.id,
      req.user!.role,
      req.user!.id
    );
    
    res.json({
      message: 'Solicitação recuperada com sucesso',
      statusCode: 200,
      data: solicitation
    });
  }

  async submit(req: AuthRequest, res: Response) {
    const solicitation = await solicitationService.submit(
      req.params.id,
      req.user!.id
    );
    
    res.json({
      message: 'Solicitação enviada com sucesso',
      statusCode: 200,
      data: solicitation
    });
  }

  async approve(req: AuthRequest, res: Response) {
    const solicitation = await solicitationService.approve(
      req.params.id,
      req.body,
      req.user!.id
    );
    
    res.json({
      message: 'Solicitação aprovada com sucesso',
      statusCode: 200,
      data: solicitation
    });
  }

  async reject(req: AuthRequest, res: Response) {
    const solicitation = await solicitationService.reject(
      req.params.id,
      req.body,
      req.user!.id
    );
    
    res.json({
      message: 'Solicitação rejeitada com sucesso',
      statusCode: 200,
      data: solicitation
    });
  }

  async pay(req: AuthRequest, res: Response) {
    const solicitation = await solicitationService.pay(
      req.params.id,
      req.user!.id
    );
    
    res.json({
      message: 'Solicitação paga com sucesso',
      statusCode: 200,
      data: solicitation
    });
  }

  async cancel(req: AuthRequest, res: Response) {
    const solicitation = await solicitationService.cancel(
      req.params.id,
      req.user!.id
    );
    
    res.json({
      message: 'Solicitação cancelada com sucesso',
      statusCode: 200,
      data: solicitation
    });
  }

  async getHistory(req: Request, res: Response) {
    const history = await solicitationService.getHistory(req.params.id);
    
    res.json({
      message: 'Histórico recuperado com sucesso',
      statusCode: 200,
      data: history
    });
  }
}
