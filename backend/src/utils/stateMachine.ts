import { SolicitationStatus, UserRole } from '../types';

export const stateTransitions: Record<SolicitationStatus, {
  allowed: SolicitationStatus[];
  roles: UserRole[];
}> = {
  [SolicitationStatus.DRAFT]: {
    allowed: [SolicitationStatus.SUBMITTED, SolicitationStatus.CANCELED],
    roles: [UserRole.EMPLOYEE]
  },
  [SolicitationStatus.SUBMITTED]: {
    allowed: [SolicitationStatus.APPROVED, SolicitationStatus.REJECTED, SolicitationStatus.CANCELED],
    roles: [UserRole.MANAGER, UserRole.EMPLOYEE]
  },
  [SolicitationStatus.APPROVED]: {
    allowed: [SolicitationStatus.PAID],
    roles: [UserRole.FINANCE]
  },
  [SolicitationStatus.REJECTED]: {
    allowed: [],
    roles: []
  },
  [SolicitationStatus.PAID]: {
    allowed: [],
    roles: []
  },
  [SolicitationStatus.CANCELED]: {
    allowed: [],
    roles: []
  }
};

export function canTransition(
  from: SolicitationStatus,
  to: SolicitationStatus,
  userRole: UserRole
): boolean {
  const transition = stateTransitions[from];
  
  if (!transition) return false;
  
  const isStatusAllowed = transition.allowed.includes(to);
  const isRoleAllowed = transition.roles.includes(userRole);
  
  return isStatusAllowed && isRoleAllowed;
}

export function getValidTransitions(
  currentStatus: SolicitationStatus,
  userRole: UserRole
): SolicitationStatus[] {
  const transition = stateTransitions[currentStatus];
  
  if (!transition) return [];
  
  return transition.allowed.filter(status => 
    transition.roles.includes(userRole)
  );
}
