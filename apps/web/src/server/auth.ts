import NextAuth, { DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db, eq, users } from "@repo/db";
import bcrypt from "bcrypt";
import { JWT } from "next-auth/jwt";
import { object, string } from "zod";
import jwt from "jsonwebtoken";

export const signInSchema = object({
  email: string({ required_error: "Email is required" })
    .min(1, "Email is required")
    .email("Invalid email"),
  password: string({ required_error: "Password is required" })
    .min(1, "Password is required")
    .min(8, "Password must be more than 8 characters")
    .max(32, "Password must be less than 32 characters"),
});

const generateAccessToken = (user: {
  userId: string;
  email: string;
  username: string;
}) => {
  return jwt.sign(user, process.env.AUTH_SECRET!, { expiresIn: "365d" });
};

declare module "next-auth" {
  interface Session {
    accessToken: string;
    user: {
      userId: string;
      email: string;
      username: string;
    } & DefaultSession["user"];
  }
  interface User {
    // id: string;
    // email: string;
    userId: string;
    username: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken: string;
    userId: string;
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
        console.log("Credentials are:", credentials ?? "No credentials");
        if (!credentials?.email || !credentials?.password) {
          console.error("Credentials are missing");
          return null;
        }

        try {
          const { email, password } = signInSchema.parse(credentials);

          console.log("Email and password are:", email + " " + password);

          const user = await db
            .select()
            .from(users)
            .where(eq(users.email, email));

          console.log("User is:", user);

          if (!user || user.length === 0) return null;

          const isPasswordValid = await bcrypt.compare(
            password,
            user[0].password
          );

          console.log("Is password valid:", isPasswordValid);

          if (!isPasswordValid){
            console.error("Password is invalid");
          };
          console.log(user[0]);

          return {
            userId: user[0].userId.toString(),
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
        token.userId = user.userId!;
        token.email = user.email!;
        token.username = user.username;
        //? I am high af right now, so I am going to add the access token here
        token.accessToken = generateAccessToken({
          userId: user.userId,
          email: user.email!,
          username: user.username,
        });
      }
      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        accessToken: token.accessToken,
        user: {
          ...session.user,
          userId: token.userId,
          email: token.email,
          username: token.username,
        },
      };
    },
  },
});
