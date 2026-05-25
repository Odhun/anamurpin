import { User } from 'firebase/auth';

export const ADMIN_EMAIL = 'odhunsoft@gmail.com';

export function isAdminUser(user: User | null): boolean {
  return !!user && !user.isAnonymous && user.email === ADMIN_EMAIL;
}
