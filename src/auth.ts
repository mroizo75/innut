import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { db } from "@/lib/db"
import authConfig from "@/auth.config"
import { getUserById } from "@/data/user"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut
} = NextAuth({
  pages: {
    signIn: "/auth/login",
    error: "auth/error"
  },
  events: {
    async linkAccount({user}) {
      await db.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() }
      })
    }
  },
  callbacks: {      
    async signIn({ user, account }) {
      if (account?.provider === "credentials") return true;
      const existingUser = await getUserById(user.id);
      return !!existingUser?.emailVerified;
    },
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
        session.user.role = token.role as string;
        session.user.bedriftId = token.bedriftId as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.bedriftId = user.bedriftId;
      }
      if (token.sub) {
        const dbUser = await getUserById(token.sub);
        if (dbUser) {
          token.role = dbUser.role;
          token.bedriftId = dbUser.bedriftId;
        }
      }
      return token;
    }
  },
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  ...authConfig,
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'E-post', type: 'email', placeholder: 'din@epost.no' },
        password: { label: 'Passord', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Manglende påloggingsinformasjon');
        }
        const user = await db.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user || !user.password) {
          throw new Error('Bruker ikke funnet eller passord ikke satt');
        }
        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error('Ugyldig påloggingsinformasjon');
        }
        return {
          id: user.id,
          name: `${user.navn} ${user.etternavn}`,
          email: user.email,
          role: user.role,
          bedriftId: user.bedriftId,
        };
      },
    }),
  ],
})