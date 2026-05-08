import { Request } from 'express';

export enum UserRole {
  EMPLOYEE = 'EMPLOYEE',
  MANAGER = 'MANAGER',
  FINANCE = 'FINANCE',
  ADMIN = 'ADMIN'
}

export enum SolicitationStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PAID = 'PAID',
  CANCELED = 'CANCELED'
}

export enum HistoryAction {
  CREATED = 'CREATED',
  UPDATED = 'UPDATED',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PAID = 'PAID',
  CANCELED = 'CANCELED'
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
  };
}

export interface ApiResponse<T = any> {
  message: string;
  statusCode: number;
  error?: string;
  data?: T;
}

export interface TransitionRule {
  from: SolicitationStatus;
  to: SolicitationStatus[];
  roles: UserRole[];
}
