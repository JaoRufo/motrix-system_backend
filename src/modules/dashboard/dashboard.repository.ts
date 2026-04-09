import { pool } from "../../config/database";
import {
  DashboardFilters,
  RevenueChartItem,
  TopCustomerItem,
} from "./dashboard.types";

export const dashboardRepository = {
  async getSummary() {
    const result = await pool.query(`
      SELECT
        COALESCE(SUM(total) FILTER (WHERE status = 'Finalizada' AND data::date = CURRENT_DATE), 0)          AS "totalRevenueToday",
        COALESCE(SUM(total) FILTER (WHERE status = 'Finalizada' AND DATE_TRUNC('month', data) = DATE_TRUNC('month', NOW())), 0) AS "totalRevenueMonth",
        COUNT(*) FILTER (WHERE status = 'Aberta')                                                            AS "totalOrdersOpen",
        COUNT(*) FILTER (WHERE status = 'Em Andamento')                                                      AS "totalOrdersInProgress",
        COUNT(*) FILTER (WHERE status = 'Finalizada')                                                        AS "totalOrdersCompleted",
        COUNT(*) FILTER (WHERE status NOT IN ('Finalizada', 'Cancelada') AND data < NOW() - INTERVAL '7 days') AS "totalOrdersLate"
      FROM ordens_servico
    `);

    const counts = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM clientes) AS "totalCustomers",
        (SELECT COUNT(*) FROM veiculos)  AS "totalVehicles"
    `);

    return { ...result.rows[0], ...counts.rows[0] };
  },

  async getRevenueChart(
    filters: DashboardFilters,
  ): Promise<RevenueChartItem[]> {
    const days = filters.days ?? 7;
    const start = filters.startDate ?? `NOW() - INTERVAL '${days} days'`;
    const end = filters.endDate ?? "NOW()";

    const useParams = !!(filters.startDate || filters.endDate);

    const query = useParams
      ? `SELECT data::date AS date, COALESCE(SUM(total), 0) AS revenue
         FROM ordens_servico
         WHERE status = 'Finalizada' AND data::date BETWEEN $1 AND $2
         GROUP BY data::date
         ORDER BY data::date`
      : `SELECT gs::date AS date, COALESCE(SUM(os.total), 0) AS revenue
         FROM generate_series(
           (NOW() - INTERVAL '${days - 1} days')::date,
           NOW()::date,
           '1 day'::interval
         ) AS gs
         LEFT JOIN ordens_servico os
           ON os.data::date = gs::date AND os.status = 'Finalizada'
         GROUP BY gs::date
         ORDER BY gs::date`;

    const result = useParams
      ? await pool.query(query, [filters.startDate, filters.endDate])
      : await pool.query(query);

    return result.rows.map((r) => ({
      date:
        r.date instanceof Date
          ? r.date.toISOString().split("T")[0]
          : String(r.date),
      revenue: Number(r.revenue),
    }));
  },

  async getTopCustomers(limit = 10): Promise<TopCustomerItem[]> {
    const result = await pool.query(
      `SELECT c.nome AS name, COUNT(os.id) AS orders
       FROM clientes c
       JOIN ordens_servico os ON os.cliente_id = c.id
       GROUP BY c.id, c.nome
       ORDER BY orders DESC
       LIMIT $1`,
      [limit],
    );
    return result.rows.map((r) => ({ name: r.name, orders: Number(r.orders) }));
  },

  async getAlerts() {
    const result = await pool.query(`
      SELECT
        COUNT(*) FILTER (
          WHERE status NOT IN ('Finalizada', 'Cancelada') AND data < NOW() - INTERVAL '7 days'
        ) AS late_orders,
        COUNT(*) FILTER (
          WHERE status NOT IN ('Finalizada', 'Cancelada')
        ) AS open_orders
      FROM ordens_servico
    `);

    const inactiveResult = await pool.query(`
      SELECT COUNT(*) AS inactive_customers
      FROM clientes c
      WHERE NOT EXISTS (
        SELECT 1 FROM ordens_servico os
        WHERE os.cliente_id = c.id AND os.data > NOW() - INTERVAL '90 days'
      )
    `);

    return {
      lateOrders: Number(result.rows[0].late_orders),
      inactiveCustomers: Number(inactiveResult.rows[0].inactive_customers),
    };
  },
};
