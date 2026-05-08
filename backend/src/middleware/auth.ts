import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { UserRole, AuthRequest } from '../types';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    throw new UnauthorizedError('Token não fornecido');
  }

  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) {
      throw new UnauthorizedError('Token inválido');
    }

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role
    };

    next();
  });
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
