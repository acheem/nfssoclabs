export enum Role {
  LEARNER = "LEARNER",
  BUSINESS_USER = "BUSINESS_USER",
  COMPANY_ADMIN = "COMPANY_ADMIN",
  PLATFORM_ADMIN = "PLATFORM_ADMIN",
}

const ROLE_HIERARCHY: Record<Role, number> = {
  [Role.LEARNER]: 0,
  [Role.BUSINESS_USER]: 1,
  [Role.COMPANY_ADMIN]: 2,
  [Role.PLATFORM_ADMIN]: 3,
};

export function hasRole(userRole: string, required: Role): boolean {
  return (ROLE_HIERARCHY[userRole as Role] ?? 0) >= ROLE_HIERARCHY[required];
}

export function isPlatformAdmin(userRole: string): boolean {
  return userRole === Role.PLATFORM_ADMIN;
}
