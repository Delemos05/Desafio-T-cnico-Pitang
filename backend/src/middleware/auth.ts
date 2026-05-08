import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { UserRole, AuthRequest } from '../types';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';

// Validação estrita das variáveis de ambiente
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

const JWT_SECRET = process.env.JWT_SECRET;

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      throw new UnauthorizedError('Token não fornecido');
    }

    jwt.verify(token, JWT_SECRET, (err: jwt.VerifyErrors | null, decoded: jwt.JwtPayload | string | undefined) => {
      if (err) {
        return next(new UnauthorizedError('Token inválido ou expirado'));
      }

      if (typeof decoded !== 'object' || !decoded) {
        return next(new UnauthorizedError('Token inválido'));
      }

      req.user = {
        id: decoded.id as string,
        email: decoded.email as string,
        role: decoded.role as UserRole
      };

      next();
    });
  } catch (error) {
    next(error);
  }
}

export function requireRole(allowedRoles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ForbiddenError('Permissão insuficiente');
    }

    next();
  };
}

export function requireOwnershipOrRole(allowedRoles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    const isOwner = req.params.userId === req.user.id;
    const hasRole = allowedRoles.includes(req.user.role);

    if (!isOwner && !hasRole) {
      throw new ForbiddenError('Acesso negado');
    }

    next();
  };
}
