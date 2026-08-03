import { Request, Response, NextFunction } from "express";
import { verifyToken } from "src/utils/jwtHelper";

export interface AuthRequest extends Request{
    userId?:string,
    role?:string
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
    req.role = decoded.role;
    req.log.info(`Operate by User[${req.userId}], Role[${req.role}]`)


    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function authObtain(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    next();
    return;
  }
  else{
 
    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    req.userId = decoded.userId;  
    req.role = decoded.role;
    req.log.info(`Operate by User[${req.userId}], Role[${req.role}]`)


    next();
  }
 
}

export function isAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Login required" });
  }

  try {
    if(req.role !== "admin"){
      return res.status(401).json({ error: "You are not admin!!!!" });
    }
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}