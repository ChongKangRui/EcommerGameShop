import { Request, Response, NextFunction } from "express";
import { verifyToken } from "src/utils/jwtHelper";

export interface AuthRequest extends Request{
    userId?:number
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Login required" });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    req.userId = decoded.userId;  
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
