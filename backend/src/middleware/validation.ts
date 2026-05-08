import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { ValidationError } from '../utils/errors';

export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error: any) {
      if (error.errors) {
        const message = error.errors.map((err: any) => err.message).join(', ');
        throw new ValidationError(message);
      }
      throw new ValidationError(error.message);
    }
  };
}

export function validateParams(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.params);
      next();
    } catch (error: any) {
      if (error.errors) {
        const message = error.errors.map((err: any) => err.message).join(', ');
        throw new ValidationError(message);
      }
      throw new ValidationError(error.message);
    }
  };
}
