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

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface Solicitation {
  id: string;
  title: string;
  description: string;
  amount: number;
  date: string;
  status: SolicitationStatus;
  justification?: string;
  createdAt: string;
  updatedAt: string;
  user: User;
  category: Category;
  attachments?: Attachment[];
  histories?: History[];
}

export interface Attachment {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
}

export interface History {
  id: string;
  action: HistoryAction;
  observation?: string;
  createdAt: string;
  user: User;
}

export interface ApiResponse<T = any> {
  message: string;
  statusCode: number;
  error?: string;
  data?: T;
}

export interface AuthResponse {
  token: string;
  user: User;
}
