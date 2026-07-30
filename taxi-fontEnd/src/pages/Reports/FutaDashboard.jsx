import React, { useEffect, useState } from "react";
import { futaReportApi } from "../../api/handoverApi";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const COLORS = ["#16a34a", "#2563eb", "#d97706", "#ea580c"];

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

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>Đang tải báo cáo thống kê...</div>;

  const fleet = stats?.fleet || {};
  const financials = stats?.financials || {};

  const fleetStatusData = [
    { name: "Sẵn sàng", value: fleet.ready || 0 },
    { name: "Đang vận hành", value: fleet.operating || 0 },
    { name: "Bảo trì", value: fleet.maintenance || 0 }
  ];

  const expenseBreakdownData = Object.keys(financials.expenseByType || {}).map((key) => ({
    name: key,
    amount: financials.expenseByType[key] || 0
  }));

  return (
    <div style={{ padding: 16, color: "#1e293b" }}>
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: "#0f172a" }}>
          📊 Báo Cáo Thống Kê Tổng Quan Futa Express
        </h1>
        <p style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>
          Tổng quan chỉ số hoạt động 05 bãi xe, tình trạng sẵn sàng đội xe tải và tổng hợp chi phí đường trường đã duyệt.
        </p>
      </div>

      {/* Metric KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 14, marginBottom: 20 }}>
        <div style={{ background: "#ffffff", padding: 18, borderRadius: 10, border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
          <div style={{ fontSize: 13, color: "#64748b", fontWeight: 600 }}>🏢 Bãi xe Trọng điểm</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#ea580c", marginTop: 4 }}>05 Bãi xe</div>
          <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>HN, HP, ĐN, HCM, CT</div>
        </div>

        <div style={{ background: "#ffffff", padding: 18, borderRadius: 10, border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
          <div style={{ fontSize: 13, color: "#64748b", fontWeight: 600 }}>🚛 Quy Mô Đội Xe Tải</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#2563eb", marginTop: 4 }}>{fleet.total || 55} Xe</div>
          <div style={{ fontSize: 12, color: "#16a34a", marginTop: 2 }}>{fleet.ready || 0} Xe sẵn sàng xuất bến</div>
        </div>

        <div style={{ background: "#ffffff", padding: 18, borderRadius: 10, border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
          <div style={{ fontSize: 13, color: "#64748b", fontWeight: 600 }}>📦 Chuyến Luân Chuyển</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#16a34a", marginTop: 4 }}>{stats?.trips?.total || 0} Chuyến</div>
          <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{stats?.trips?.inTransit || 0} Chuyến đang chạy</div>
        </div>

        <div style={{ background: "#ffffff", padding: 18, borderRadius: 10, border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
          <div style={{ fontSize: 13, color: "#64748b", fontWeight: 600 }}>💵 Chi Phí Đã Duyệt</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#d97706", marginTop: 4 }}>
            {(financials.totalExpensesAmount || 0).toLocaleString("vi-VN")} đ
          </div>
          <div style={{ fontSize: 12, color: "#dc2626", marginTop: 2 }}>
            {financials.pendingExpensesCount || 0} khoản đang chờ duyệt
          </div>
        </div>
      </div>

      {/* Visualizations Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Chart 1: Fleet Status */}
        <div style={{ background: "#ffffff", padding: 18, borderRadius: 10, border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, borderBottom: "1px solid #f1f5f9", paddingBottom: 8, color: "#0f172a" }}>
            🟢 Trạng Thái Hoạt Động Đội Xe Tải
          </h3>
          <div style={{ width: "100%", height: 250 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={fleetStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
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
        <div style={{ background: "#ffffff", padding: 18, borderRadius: 10, border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, borderBottom: "1px solid #f1f5f9", paddingBottom: 8, color: "#0f172a" }}>
            💸 Phân Bổ Chi Phí Đường Trường Theo Loại (VND)
          </h3>
          <div style={{ width: "100%", height: 250 }}>
            <ResponsiveContainer>
              <BarChart data={expenseBreakdownData}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip formatter={(val) => `${val.toLocaleString("vi-VN")} VNĐ`} />
                <Bar dataKey="amount" fill="#ea580c" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FutaDashboard;
