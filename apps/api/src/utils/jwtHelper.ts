import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const EXPIRY = "1h";
const EXPIRY_REMEMBER = "14d";

export function generateToken(userId: number, role:string, rememberMe: boolean = false) {
  return jwt.sign({ userId, role}, SECRET, {
    expiresIn: rememberMe ? EXPIRY_REMEMBER : EXPIRY,
  });
}

// check signature if this token was created with my secret
export function verifyToken(token: string) {
  return jwt.verify(token, SECRET) as { userId: number, role: string };
}