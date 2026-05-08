import { 
  CreateSolicitationInput, 
  UpdateSolicitationInput, 
  ApproveRejectInput 
} from '../schemas/solicitation';
import { 
  UserRole,
  AuthRequest 
} from '../types';
import { 
  ValidationError, 
  ForbiddenError, 
  NotFoundError,
  InvalidStateTransitionError 
} from '../utils/errors';
import { canTransition } from '../utils/stateMachine';
import prisma from '../lib/prisma';
import { SolicitationStatus, HistoryAction } from '@prisma/client';

export class SolicitationService {
  async create(data: CreateSolicitationInput, userId: string) {
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId }
    });

    if (!category || !category.isActive) {
      throw new ValidationError('Categoria inválida ou inativa');
    }

    const solicitation = await prisma.solicitation.create({
      data: {
        ...data,
        userId,
        status: SolicitationStatus.DRAFT,
        date: new Date(data.date)
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        category: true
      }
    });

    await this.createHistory(
      solicitation.id,
      userId,
      HistoryAction.CREATED,
      'Solicitação criada'
    );

    return solicitation;
  }

  async update(id: string, data: UpdateSolicitationInput, userId: string) {
    const solicitation = await prisma.solicitation.findUnique({
      where: { id }
    });

    if (!solicitation) {
      throw new NotFoundError('Solicitação não encontrada');
    }

    if (solicitation.userId !== userId) {
      throw new ForbiddenError('Você só pode editar suas próprias solicitações');
    }

    if (solicitation.status !== SolicitationStatus.DRAFT) {
      throw new ValidationError('Só é possível editar solicitações em status DRAFT');
    }

    if (data.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: data.categoryId }
      });

      if (!category || !category.isActive) {
        throw new ValidationError('Categoria inválida ou inativa');
      }
    }

    const updated = await prisma.solicitation.update({
      where: { id },
      data: {
        ...data,
        date: data.date ? new Date(data.date) : undefined
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        category: true
      }
    });

    await this.createHistory(
      id,
      userId,
      HistoryAction.UPDATED,
      'Solicitação atualizada'
    );

    return updated;
  }

  async submit(id: string, userId: string) {
    const solicitation = await prisma.solicitation.findUnique({
      where: { id }
    });

    if (!solicitation) {
      throw new NotFoundError('Solicitação não encontrada');
    }

    if (solicitation.userId !== userId) {
      throw new ForbiddenError('Você só pode enviar suas próprias solicitações');
    }

    if (!canTransition(solicitation.status, SolicitationStatus.SUBMITTED, UserRole.EMPLOYEE)) {
      throw new InvalidStateTransitionError(solicitation.status, SolicitationStatus.SUBMITTED);
    }

    const updated = await prisma.solicitation.update({
      where: { id },
      data: { status: SolicitationStatus.SUBMITTED },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        category: true
      }
    });

    await this.createHistory(
      id,
      userId,
      HistoryAction.SUBMITTED,
      'Solicitação enviada para aprovação'
    );

    return updated;
  }

  async approve(id: string, data: ApproveRejectInput, userId: string) {
    const solicitation = await prisma.solicitation.findUnique({
      where: { id }
    });

    if (!solicitation) {
      throw new NotFoundError('Solicitação não encontrada');
    }

    // Verifica se o usuário existe e tem permissão de MANAGER
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user || user.role !== UserRole.MANAGER) {
      throw new ForbiddenError('Apenas gerentes podem aprovar solicitações');
    }

    if (!canTransition(solicitation.status, SolicitationStatus.APPROVED, UserRole.MANAGER)) {
      throw new InvalidStateTransitionError(solicitation.status, SolicitationStatus.APPROVED);
    }

    const updated = await prisma.solicitation.update({
      where: { id },
      data: { 
        status: SolicitationStatus.APPROVED,
        justification: data.observation
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        category: true
      }
    });

    await this.createHistory(
      id,
      userId,
      HistoryAction.APPROVED,
      data.observation
    );

    return updated;
  }

  async reject(id: string, data: ApproveRejectInput, userId: string) {
    const solicitation = await prisma.solicitation.findUnique({
      where: { id }
    });

    if (!solicitation) {
      throw new NotFoundError('Solicitação não encontrada');
    }

    // Verifica se o usuário existe e tem permissão de MANAGER
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user || user.role !== UserRole.MANAGER) {
      throw new ForbiddenError('Apenas gerentes podem rejeitar solicitações');
    }

    if (!canTransition(solicitation.status, SolicitationStatus.REJECTED, UserRole.MANAGER)) {
      throw new InvalidStateTransitionError(solicitation.status, SolicitationStatus.REJECTED);
    }

    const updated = await prisma.solicitation.update({
      where: { id },
      data: { 
        status: SolicitationStatus.REJECTED,
        justification: data.observation
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        category: true
      }
    });

    await this.createHistory(
      id,
      userId,
      HistoryAction.REJECTED,
      data.observation
    );

    return updated;
  }

  async pay(id: string, userId: string) {
    const solicitation = await prisma.solicitation.findUnique({
      where: { id }
    });

    if (!solicitation) {
      throw new NotFoundError('Solicitação não encontrada');
    }

    // Verifica se o usuário existe e tem permissão de FINANCE
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user || user.role !== UserRole.FINANCE) {
      throw new ForbiddenError('Apenas financeiro pode pagar solicitações');
    }

    if (!canTransition(solicitation.status, SolicitationStatus.PAID, UserRole.FINANCE)) {
      throw new InvalidStateTransitionError(solicitation.status, SolicitationStatus.PAID);
    }

    const updated = await prisma.solicitation.update({
      where: { id },
      data: { status: SolicitationStatus.PAID },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        category: true
      }
    });

    await this.createHistory(
      id,
      userId,
      HistoryAction.PAID,
      'Solicitação paga'
    );

    return updated;
  }

  async cancel(id: string, userId: string) {
    const solicitation = await prisma.solicitation.findUnique({
      where: { id }
    });

    if (!solicitation) {
      throw new NotFoundError('Solicitação não encontrada');
    }

    const isOwner = solicitation.userId === userId;
    const canCancelByRole = isOwner && solicitation.status === SolicitationStatus.DRAFT;
    const canCancelByManager = solicitation.status === SolicitationStatus.SUBMITTED;

    if (!canCancelByRole && !canCancelByManager) {
      throw new ValidationError('Não é possível cancelar esta solicitação');
    }

    const updated = await prisma.solicitation.update({
      where: { id },
      data: { status: SolicitationStatus.CANCELED },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        category: true
      }
    });

    await this.createHistory(
      id,
      userId,
      HistoryAction.CANCELED,
      'Solicitação cancelada'
    );

    return updated;
  }

  async list(
    userRole: UserRole, 
    userId?: string, 
    page: number = 1, 
    limit: number = 50,
    filters?: {
      status?: string;
      categoryId?: string;
      userId?: string;
      search?: string;
      sortBy?: 'createdAt' | 'amount' | 'title';
      sortOrder?: 'asc' | 'desc';
    }
  ) {
    // Constrói condição WHERE baseada no role e filtros
    const where: any = {};

    // Filtro por role (EMPLOYEE só vê próprias)
    if (userRole === UserRole.EMPLOYEE && userId) {
      where.userId = userId;
    }

    // Filtros adicionais
    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters?.userId && (userRole === UserRole.ADMIN || userRole === UserRole.MANAGER)) {
      where.userId = filters.userId;
    }

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    // Ordenação
    const orderBy: any = {};
    if (filters?.sortBy) {
      orderBy[filters.sortBy] = filters.sortOrder || 'desc';
    } else {
      orderBy.createdAt = 'desc'; // Default
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.solicitation.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          category: true
        },
        orderBy
      }),
      prisma.solicitation.count({ where })
    ]);

    // Se não houver paginação (limit >= total), retorna formato original para compatibilidade
    if (limit >= total) {
      return data;
    }

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    };
  }

  async findById(id: string, userRole: UserRole, userId?: string) {
    const solicitation = await prisma.solicitation.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        category: true,
        attachments: true,
        histories: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    });

    if (!solicitation) {
      throw new NotFoundError('Solicitação não encontrada');
    }

    if (userRole === UserRole.EMPLOYEE && solicitation.userId !== userId) {
      throw new ForbiddenError('Acesso negado');
    }

    return solicitation;
  }

  async getHistory(id: string) {
    return prisma.history.findMany({
      where: { solicitationId: id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });
  }

  private async createHistory(
    solicitationId: string,
    userId: string,
    action: HistoryAction,
    observation?: string
  ) {
    return prisma.history.create({
      data: {
        solicitationId,
        userId,
        action,
        observation
      }
    });
  }
}
