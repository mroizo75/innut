import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "PROSJEKLEDER" | "LEDER" | "USER";
      bedriftId: string;
    } & DefaultSession["user"]
  }

  interface User {
    role: "ADMIN" | "PROSJEKLEDER" | "LEDER" | "USER";
    bedriftId: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "ADMIN" | "PROSJEKLEDER" | "LEDER" | "USER";
    bedriftId?: string;
  }
}