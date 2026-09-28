import type { Request, Response } from "express";
import { runCleanupJob } from "src/cron/cleanup";
import { logger } from "src/utils/loggerHelper";

// HTTP trigger for the order cleanup job. Runs the exact same job as the
// in-process schedule in cron/cleanup.ts — used by an external scheduler
// (e.g. GitHub Actions) when the host sleeps and node-cron can't fire.
export const runCleanupRoute = async (req: Request, res: Response) => {
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    logger.error("CRON_SECRET is not set — refusing to run HTTP cleanup trigger");
    return res.status(503).json({ error: "Cron endpoint not configured" });
  }

  const provided = req.headers["x-cron-key"];
  if (provided !== secret) {
    logger.warn("Rejected HTTP cleanup trigger: bad or missing x-cron-key");
    return res.status(401).json({ error: "Unauthorized" });
  }

  logger.info("Order cleanup triggered via HTTP route");
  try {
    await runCleanupJob();
    return res.status(200).json({ ok: true });
  } catch (e) {
    logger.error("HTTP-triggered order cleanup failed", e);
    return res.status(500).json({ error: "Cleanup failed" });
  }
};
