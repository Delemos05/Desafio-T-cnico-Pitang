import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json(error.toJSON());
  }

  console.error('Unexpected error:', error);
  
  return res.status(500).json({
    message: 'Erro interno do servidor',
    statusCode: 500,
    error: 'Internal Server Error'
  });
}
