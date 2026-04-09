import { Router, Request, Response } from "express";
import { isAuthenticated, isActive } from "../../middlewares/auth.middleware";
import { dashboardController } from "./dashboard.controller";

const router = Router();

const protect = [isAuthenticated, isActive];

router.get("/summary", protect, (req: Request, res: Response) =>
  dashboardController.getSummary(req as any, res),
);
router.get("/revenue-chart", protect, (req: Request, res: Response) =>
  dashboardController.getRevenueChart(req as any, res),
);
router.get("/top-customers", protect, (req: Request, res: Response) =>
  dashboardController.getTopCustomers(req as any, res),
);
router.get("/alerts", protect, (req: Request, res: Response) =>
  dashboardController.getAlerts(req as any, res),
);

export default router;
