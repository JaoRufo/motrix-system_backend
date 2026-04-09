import { dashboardRepository } from "./dashboard.repository";
import {
  AlertItem,
  DashboardFilters,
  DashboardSummary,
  RevenueChartItem,
  TopCustomerItem,
} from "./dashboard.types";

export const dashboardService = {
  async getSummary(): Promise<DashboardSummary> {
    const raw = await dashboardRepository.getSummary();
    return {
      totalRevenueToday: Number(raw.totalRevenueToday),
      totalRevenueMonth: Number(raw.totalRevenueMonth),
      totalOrdersOpen: Number(raw.totalOrdersOpen),
      totalOrdersInProgress: Number(raw.totalOrdersInProgress),
      totalOrdersCompleted: Number(raw.totalOrdersCompleted),
      totalOrdersLate: Number(raw.totalOrdersLate),
      totalCustomers: Number(raw.totalCustomers),
      totalVehicles: Number(raw.totalVehicles),
    };
  },

  async getRevenueChart(
    filters: DashboardFilters,
  ): Promise<RevenueChartItem[]> {
    return dashboardRepository.getRevenueChart(filters);
  },

  async getTopCustomers(limit = 10): Promise<TopCustomerItem[]> {
    return dashboardRepository.getTopCustomers(limit);
  },

  async getAlerts(): Promise<AlertItem[]> {
    const { lateOrders, inactiveCustomers } =
      await dashboardRepository.getAlerts();
    const alerts: AlertItem[] = [];

    if (lateOrders > 0) {
      alerts.push({
        type: "warning",
        message: `${lateOrders} ${lateOrders === 1 ? "ordem atrasada" : "ordens atrasadas"}`,
      });
    }

    if (inactiveCustomers > 0) {
      alerts.push({
        type: "info",
        message: `${inactiveCustomers} ${inactiveCustomers === 1 ? "cliente inativo" : "clientes inativos"} há mais de 90 dias`,
      });
    }

    if (alerts.length === 0) {
      alerts.push({ type: "info", message: "Nenhum alerta no momento" });
    }

    return alerts;
  },
};
