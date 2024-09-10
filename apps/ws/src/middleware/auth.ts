import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { getEnvVariable } from "../utils";

interface User {
  userId: string;
  username: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export default function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    // Get token from headers
    const token = req.headers.authorization?.split(" ")[1];
    console.log("token", token);
    if (!token) {
      return res.status(401).json({ message: "Authentication error: No token provided" });
    }

    console.log("JWT_SECRET", getEnvVariable("JWT_SECRET"));

    const decoded = jwt.verify(token, getEnvVariable("JWT_SECRET")) as User;
    console.log("decoded", decoded);

    if (!decoded) {
      return res.status(401).json({ message: "Authentication error: Invalid token" });
    }

    req.user = decoded as User;
    next();
  } catch (error) {
    console.error("Error during authentication:", error);
    return res.status(401).json({ message: "Authentication error" });
  }
}