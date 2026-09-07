export const USER_ROLES = ['admin'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export type AdminUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
  lastLoginAt: string | null;
};

/** The claims carried in the session cookie. Never include anything sensitive. */
export type SessionPayload = {
  sub: string;
  email: string;
  name: string;
  role: UserRole;
};
