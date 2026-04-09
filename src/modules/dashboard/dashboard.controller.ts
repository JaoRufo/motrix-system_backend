import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { dashboardService } from "./dashboard.service";
import { DashboardFilters } from "./dashboard.types";

export const dashboardController = {
  async getSummary(req: AuthRequest, res: Response): Promise<void> {
    const data = await dashboardService.getSummary();
    res.json(data);
  },

  async getRevenueChart(req: AuthRequest, res: Response): Promise<void> {
    const { startDate, endDate, days } = req.query as Record<string, string>;
    const filters: DashboardFilters = {
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      days: days ? parseInt(days) : undefined,
    };
    const data = await dashboardService.getRevenueChart(filters);
    res.json(data);
  },

  async getTopCustomers(req: AuthRequest, res: Response): Promise<void> {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const data = await dashboardService.getTopCustomers(limit);
    res.json(data);
  },

  async getAlerts(req: AuthRequest, res: Response): Promise<void> {
    const data = await dashboardService.getAlerts();
    res.json(data);
  },
};
