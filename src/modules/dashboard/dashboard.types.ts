export interface DashboardSummary {
  totalRevenueToday: number;
  totalRevenueMonth: number;
  totalOrdersOpen: number;
  totalOrdersInProgress: number;
  totalOrdersCompleted: number;
  totalOrdersLate: number;
  totalCustomers: number;
  totalVehicles: number;
}

export interface RevenueChartItem {
  date: string;
  revenue: number;
}

export interface TopCustomerItem {
  name: string;
  orders: number;
}

export type AlertType = "warning" | "info";

export interface AlertItem {
  type: AlertType;
  message: string;
}

export interface DashboardFilters {
  startDate?: string;
  endDate?: string;
  days?: number;
}
