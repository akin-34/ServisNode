import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { db } from "./db";
import bcrypt from "bcrypt";
import { UserRole } from "@prisma/client";

/**
 * ServisNode Advanced Authentication Configuration
 * 
 * Includes:
 * - Prisma Adapter for persistent sessions
 * - Multiple OAuth Providers (Google, GitHub)
 * - Credentials Provider with Bcrypt hashing
 * - Role-based session injection
 * - Custom login pages
 */
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 Days
    updateAge: 24 * 60 * 60,    // 24 Hours
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
    newUser: "/auth/new-user",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "ServisNode Enterprise Login",
      credentials: {
        email: { label: "Email Address", type: "email", placeholder: "user@organization.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials for ServisNode login.");
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email },
          include: {
            organization: true,
            department: true,
          }
        });

        if (!user || !user.password) {
          throw new Error("Invalid username or password configuration.");
        }

        if (user.status !== "ACTIVE") {
          throw new Error("Account is suspended or pending activation.");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("The credentials provided are incorrect.");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          organization: user.organization?.name,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, profile, trigger, session }) {
      // Logic for token generation and session updates
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.organization = (user as any).organization;
      }

      // Handle session updates (e.g., when profile is updated)
      if (trigger === "update" && session) {
        token.name = session.user.name;
        token.image = session.user.image;
        token.role = session.user.role;
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.organization = token.organization as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log(`[AUTH] User signed in: ${user.email} via ${account?.provider}`);
      // Audit log registration
      await db.auditLog.create({
        data: {
          action: "SIGN_IN",
          entity: "USER",
          entityId: user.id as string,
          userId: user.id as string,
          details: {
            provider: account?.provider,
            isNewUser,
            timestamp: new Date().toISOString(),
          },
        }
      });
    },
    async signOut({ session, token }) {
      console.log(`[AUTH] User signed out: ${token.email}`);
    },
    async createUser({ user }) {
        console.log(`[AUTH] New user created: ${user.email}`);
        // Initialize default settings for new user
    },
    async updateUser({ user }) {
        console.log(`[AUTH] User updated: ${user.email}`);
    },
    async linkAccount({ user, account, profile }) {
        console.log(`[AUTH] Account linked: ${user.email} to ${account.provider}`);
    },
    async session({ session, token }) {
        // Triggered every time a session is checked
    },
  },
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET,
  logger: {
    error(code, metadata) {
      console.error(`[NEXT_AUTH_ERROR][${code}]`, metadata);
    },
    warn(code) {
      console.warn(`[NEXT_AUTH_WARN][${code}]`);
    },
    debug(code, metadata) {
      if (process.env.NODE_ENV === "development") {
        console.log(`[NEXT_AUTH_DEBUG][${code}]`, metadata);
      }
    },
  },
};

/**
 * Helper to get session on server-side (Server Components / Actions)
 */
import { getServerSession } from "next-auth";

export const getAuthSession = () => getServerSession(authOptions);

/**
 * Access Control Helpers
 */
export const isAdmin = (role: UserRole) => role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN;
export const isTechnician = (role: UserRole) => role === UserRole.TECHNICIAN || isAdmin(role);
export const isManager = (role: UserRole) => role === UserRole.MANAGER || isAdmin(role);
