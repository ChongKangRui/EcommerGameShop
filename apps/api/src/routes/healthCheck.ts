import { Router} from "express";
import { healthCheckFn } from "src/controllers/healthChechController";

const router = Router();

router.get("/",healthCheckFn);

export default router;
