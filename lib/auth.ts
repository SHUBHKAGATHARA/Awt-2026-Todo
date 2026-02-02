import { compare, hash } from 'bcryptjs';
import { prisma } from './prisma';
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

// Hash a password
export async function hashPassword(password: string): Promise<string> {
  return await hash(password, 12);
}

// Verify a password against a hash
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await compare(password, hashedPassword);
}

// Authenticate user with username and password
export async function authenticateUser(username: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      userRoles: {
        include: {
          role: true,
        },
      },
    },
  });

  if (!user) {
    return null;
  }

  const isValid = await verifyPassword(password, user.password);

  if (!isValid) {
    return null;
  }

  return {
    id: user.id.toString(),
    username: user.username,
    email: user.email,
    roles: user.userRoles.map((ur) => ur.role.roleName),
  };
}

// NextAuth configuration
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error('Please enter username and password');
        }

        const user = await authenticateUser(
          credentials.username as string,
          credentials.password as string
        );

        if (!user) {
          throw new Error('Invalid username or password');
        }

        return user as any;
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = (user as any).username;
        token.email = user.email;
        token.roles = (user as any).roles;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id;
        (session.user as any).username = token.username;
        (session.user as any).roles = token.roles;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});
