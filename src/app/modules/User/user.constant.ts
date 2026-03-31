export const USER_ROLE = {
  superAdmin: 'superAdmin',
  admin: 'admin',
  user: 'user',
  adsOwner: 'adsOwner',
  member: 'member',
} as const;

export enum UserStatus {
  IN_PROGRESS = 'in-progress',
  BLOCKED = 'blocked',
  ACTIVE = 'active',
}

export enum UserRole {
  ADMIN = 'admin',
  SUPER_ADMIN = 'superAdmin',
  USER = 'user',
}

export const isEmailValid = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
