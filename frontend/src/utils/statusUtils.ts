import { SolicitationStatus, UserRole } from '../types';

export const statusColors: Record<SolicitationStatus, string> = {
  [SolicitationStatus.DRAFT]: 'bg-gray-100 text-gray-800',
  [SolicitationStatus.SUBMITTED]: 'bg-blue-100 text-blue-800',
  [SolicitationStatus.APPROVED]: 'bg-green-100 text-green-800',
  [SolicitationStatus.REJECTED]: 'bg-red-100 text-red-800',
  [SolicitationStatus.PAID]: 'bg-purple-100 text-purple-800',
  [SolicitationStatus.CANCELED]: 'bg-yellow-100 text-yellow-800',
};

export const statusLabels: Record<SolicitationStatus, string> = {
  [SolicitationStatus.DRAFT]: 'Rascunho',
  [SolicitationStatus.SUBMITTED]: 'Enviado',
  [SolicitationStatus.APPROVED]: 'Aprovado',
  [SolicitationStatus.REJECTED]: 'Rejeitado',
  [SolicitationStatus.PAID]: 'Pago',
  [SolicitationStatus.CANCELED]: 'Cancelado',
};

export const roleLabels: Record<UserRole, string> = {
  [UserRole.EMPLOYEE]: 'Funcionário',
  [UserRole.MANAGER]: 'Gerente',
  [UserRole.FINANCE]: 'Financeiro',
  [UserRole.ADMIN]: 'Administrador',
};

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
}

export function canUserPerformAction(
  userRole: UserRole,
  status: SolicitationStatus,
  action: string,
  isOwner: boolean = false
): boolean {
  switch (action) {
    case 'edit':
      return isOwner && status === SolicitationStatus.DRAFT;
    case 'submit':
      return isOwner && status === SolicitationStatus.DRAFT;
    case 'approve':
    case 'reject':
      return userRole === UserRole.MANAGER && status === SolicitationStatus.SUBMITTED;
    case 'pay':
      return userRole === UserRole.FINANCE && status === SolicitationStatus.APPROVED;
    case 'cancel':
      return (isOwner && status === SolicitationStatus.DRAFT) || 
             (userRole === UserRole.MANAGER && status === SolicitationStatus.SUBMITTED);
    default:
      return false;
  }
}
