import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { db, eq, users } from "@repo/db";

export async function POST(req : Request) {
    try {

        const data = await req.json();
      const hashedPassword = await bcrypt.hash(data.password, 10);

      const user = await db.select().from(users).where(eq(users.email, data.email));

      if(user.length > 0) {
        return NextResponse.json({
            error: "User with this email already exists"
            }, {
            status: 400
        })
      }

      await db.insert(users).values({
        username: data.username,
        email: data.email,
        password: hashedPassword
      })

      return NextResponse.json({
        message: "Account created successfully",
        status : 200
      }); 
      
    } catch (error) {
        console.error(error);
        return NextResponse.json({
            error: "Failed to create account. Please try again."
        }, {
            status: 500
        })
    }
}