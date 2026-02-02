import { auth } from './auth';

export async function getCurrentUser() {
  const session = await auth();
  
  if (!session?.user) {
    return null;
  }

  return {
    id: parseInt((session.user as any).id),
    username: (session.user as any).username,
    email: session.user.email,
    roles: (session.user as any).roles || [],
  };
}
