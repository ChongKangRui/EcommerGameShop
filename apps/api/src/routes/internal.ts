import { Router } from "express";
import { runCleanupRoute } from "src/controllers/cronController";

const router = Router();

// POST /internal/cron/cleanup  — header: x-cron-key: <CRON_SECRET>
router.post("/cron/cleanup", runCleanupRoute);

export default router;
