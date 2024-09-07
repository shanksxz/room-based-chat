import NextAuth, { DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db, eq, users } from "@repo/db";
import bcrypt from "bcrypt";
import { JWT } from "next-auth/jwt";
import { object, string } from "zod"
import jwt from "jsonwebtoken";

export const signInSchema = object({
  email: string({ required_error: "Email is required" })
    .min(1, "Email is required")
    .email("Invalid email"),
  password: string({ required_error: "Password is required" })
    .min(1, "Password is required")
    .min(8, "Password must be more than 8 characters")
    .max(32, "Password must be less than 32 characters"),
})

const generateAccessToken = (user: { id: string; email: string; username: string }) => {
  return jwt.sign(user, process.env.AUTH_SECRET!, { expiresIn: '1h' });
};

declare module "next-auth" {
  interface Session {
    accessToken: string;
    user: {
      id: string;
      email: string;
      username: string;
    } & DefaultSession["user"];
  }
  interface User {
    // id: string;
    // email: string;
    username: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken: string;
    id: string;
    email: string;
    username: string;
  }
}

export const {
  handlers: { GET, POST },
  signIn,
  signOut,
  auth,
} = NextAuth({
  trustHost: true,
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, request): Promise<any | null> {
        if (!credentials?.email || !credentials?.password) return null;
        
        const {
          email,
          password,
        } = signInSchema.parse(credentials);
        
        try {
          const user = await db.select().from(users).where(eq(users.email, email));
          
          if (!user || user.length === 0) return null;
          
          const isPasswordValid = await bcrypt.compare(password, user[0].password);
          
          if (!isPasswordValid) return null;
          console.log(user[0]);
          
          return {
            id: user[0].id.toString(),
            email: user[0].email,
            username: user[0].username,
          };
      
        } catch (error) {
          console.error("Error during authentication:", error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.email = user.email!;
        token.username = user.username;
        //? I am high af right now, so I am going to add the access token here
        token.accessToken = generateAccessToken({ id: user.id!, email: user.email!, username: user.username });
      }
      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        accessToken: token.accessToken,
        user: {
          ...session.user,
          id: token.id,
          email: token.email,
          username: token.username,
        },
      }
    },
  },
});