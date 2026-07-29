
import type { Request, Response } from "express";
import type { AuthRequest } from "src/middleWare/auth";
import { userService } from "src/services/userService";

export const register = async (req: Request, res: Response) => {
  try {
    const result = await userService.register(req.body, req.log);
    if (!result.ok)
      return res
        .status(result.status)
        .json({ error: result.error, details: result.details });
    return res.status(201).json(result.data);
  } catch (e) {
    req.log.error("Error in register", e);
    return res.status(500).json({ error: "Registration failed" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const result = await userService.login(req.body, req.log);
    if (!result.ok)
      return res.status(result.status).json({ error: result.error });
    return res.status(200).json(result.data);
  } catch (e) {
    req.log.error("Error in login", e);
    return res.status(500).json({ error: "Invalid email or password" });
  }
};

export const verifyUser = async (req: AuthRequest, res: Response) => {
  try {
    const result = await userService.verifyUser(req.userId!, req.log);
    if (!result.ok)
      return res.status(result.status).json({ error: result.error });
    return res.status(200).json(result.data);
  } catch (e) {
    req.log.error("Error in verify user", e);
    return res.status(500).json({ error: "Server error" });
  }
};

export const updateUserInfo = async (req: AuthRequest, res: Response) => {
  try {
    const result = await userService.updateUserInfo(
      req.userId!,
      req.body,
      req.log,
    );
    if (!result.ok)
      return res.status(result.status).json({ error: result.error });
    return res.status(200).json(result.data);
  } catch (e) {
    req.log.error("Error in update user info", e);
    return res.status(500).json({ error: "Update userInfo failed" });
  }
};

export const updatePassword = async (req: AuthRequest, res: Response) => {
  try {
    const result = await userService.updatePassword(
      req.userId!,
      req.body,
      req.log,
    );
    if (!result.ok)
      return res.status(result.status).json({ error: result.error });
    return res.status(200).json(result.data);
  } catch (e) {
    req.log.error("Error in update password", e);
    return res.status(500).json({ error: "Update password failed" });
  }
};
