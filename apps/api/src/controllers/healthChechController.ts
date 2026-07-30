import type { Request,Response } from "express";

export const healthCheckFn = (_req: Request, res: Response) => {
  return res.status(200).json({message: "Server is working"});
};