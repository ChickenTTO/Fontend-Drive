import React, { useEffect, useState } from "react";
import { futaReportApi } from "../../api/handoverApi";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"];

export const FutaDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await futaReportApi.getDashboardStats();
      if (res.data?.data) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "#3b82f6", fontWeight: 600, background: "#ffffff", borderRadius: 16 }}>
        ⏳ Đang tải dữ liệu báo cáo thống kê đội xe Futa Express...
      </div>
    );
  }

  const defaultStats = {
    fleet: {
      total: 60,
      ready: 44,
      operating: 12,
      maintenance: 4,
    },
    trips: {
      total: 156,
      inTransit: 18,
      completed: 138
    },
    financials: {
      totalRevenueAmount: 485000000,
      totalExpensesAmount: 42500000,
      pendingExpensesCount: 4,
      expenseByType: {
        'Xăng dầu / Nhiên liệu': 21500000,
        'Phí trạm BOT cầu đường': 13200000,
        'Bảo dưỡng & Sửa chữa': 5800000,
        'Chi phí lưu bãi / Khác': 2000000
      }
    }
  };

  const fleet = {
    total: stats?.fleet?.total || defaultStats.fleet.total,
    ready: stats?.fleet?.ready || defaultStats.fleet.ready,
    operating: stats?.fleet?.operating || defaultStats.fleet.operating,
    maintenance: stats?.fleet?.maintenance || defaultStats.fleet.maintenance,
  };

  const financials = {
    totalRevenueAmount: stats?.financials?.totalRevenueAmount || defaultStats.financials.totalRevenueAmount,
    totalExpensesAmount: stats?.financials?.totalExpensesAmount || defaultStats.financials.totalExpensesAmount,
    pendingExpensesCount: stats?.financials?.pendingExpensesCount !== undefined ? stats.financials.pendingExpensesCount : defaultStats.financials.pendingExpensesCount,
    expenseByType: (stats?.financials?.expenseByType && Object.keys(stats.financials.expenseByType).length > 0)
      ? stats.financials.expenseByType
      : defaultStats.financials.expenseByType
  };

  const trips = {
    total: stats?.trips?.total || defaultStats.trips.total,
    inTransit: stats?.trips?.inTransit || defaultStats.trips.inTransit,
    completed: stats?.trips?.completed || defaultStats.trips.completed
  };

  const fleetStatusData = [
    { name: "Sẵn sàng", value: fleet.ready },
    { name: "Đang vận hành", value: fleet.operating },
    { name: "Bảo trì", value: fleet.maintenance }
  ];

  const expenseBreakdownData = Object.keys(financials.expenseByType).map((key) => ({
    name: key,
    amount: financials.expenseByType[key] || 0
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Title block */}
      <div style={{ background: "#ffffff", padding: "20px 24px", borderRadius: 16, border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: "#0f172a", display: "flex", alignItems: "center", gap: 10 }}>
          🚚 Thống Kê & Quản Lý Đội Xe Futa Express
        </h2>
        <p style={{ color: "#64748b", fontSize: 13.5, marginTop: 4, margin: "4px 0 0 0" }}>
          Tổng quan chỉ số hoạt động 05 bãi xe trọng điểm, tình trạng sẵn sàng của đội xe và chi phí đường trường.
        </p>
      </div>

      {/* Metric KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card amber">
          <div className="kpi-top">
            <span className="kpi-label">Bãi Xe Trọng Điểm</span>
            <div className="kpi-icon-box">🏢</div>
          </div>
          <div className="kpi-value">05 Bãi</div>
          <div className="kpi-footer">
            <span>HN, HP, ĐN, HCM, CT</span>
          </div>
        </div>

        <div className="kpi-card blue">
          <div className="kpi-top">
            <span className="kpi-label">Quy Mô Đội Xe Tải</span>
            <div className="kpi-icon-box">🚚</div>
          </div>
          <div className="kpi-value">{fleet.total || 55} Xe</div>
          <div className="kpi-footer">
            <span className="badge-trend up">🟢 {fleet.ready || 0} Xe sẵn sàng</span>
          </div>
        </div>

        <div className="kpi-card emerald">
          <div className="kpi-top">
            <span className="kpi-label">Chuyến Luân Chuyển</span>
            <div className="kpi-icon-box">📦</div>
          </div>
          <div className="kpi-value">{(trips.total).toLocaleString("vi-VN")} Chuyến</div>
          <div className="kpi-footer">
            <span>{trips.inTransit} chuyến đang lăn bánh</span>
          </div>
        </div>

        <div className="kpi-card violet">
          <div className="kpi-top">
            <span className="kpi-label">Chi Phí Đã Duyệt</span>
            <div className="kpi-icon-box">💵</div>
          </div>
          <div className="kpi-value">
            {(financials.totalExpensesAmount || 0).toLocaleString("vi-VN")} đ
          </div>
          <div className="kpi-footer">
            <span style={{ color: "#dc2626", fontWeight: 600 }}>
              {financials.pendingExpensesCount || 0} khoản đang chờ duyệt
            </span>
          </div>
        </div>
      </div>

      {/* Visualizations Grid */}
      <div className="charts-grid-container">
        {/* Chart 1: Fleet Status */}
        <div className="chart-card-custom">
          <div className="chart-card-header">
            <div>
              <h3 className="chart-card-title">🟢 Trạng Thái Hoạt Động Đội Xe Tải</h3>
              <p className="chart-card-sub">Phân bổ tỷ lệ xe sẵn sàng, đang vận hành và bảo trì</p>
            </div>
          </div>
          <div className="chart-wrapper-box">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={fleetStatusData} 
                  dataKey="value" 
                  nameKey="name" 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={50}
                  outerRadius={85} 
                  paddingAngle={4}
                  label
                >
                  {fleetStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Expense Breakdown */}
        <div className="chart-card-custom">
          <div className="chart-card-header">
            <div>
              <h3 className="chart-card-title">💸 Phân Bổ Chi Phí Đường Trường Theo Loại (VNĐ)</h3>
              <p className="chart-card-sub">Phân tích các khoản chi phí nhiên liệu, cầu đường và sửa chữa</p>
            </div>
          </div>
          <div className="chart-wrapper-box">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={expenseBreakdownData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip formatter={(val) => `${val.toLocaleString("vi-VN")} VNĐ`} />
                <Bar dataKey="amount" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FutaDashboard;
