import React, { useState } from "react";
import { NavLink as RouterNavLink, useNavigate } from "react-router-dom";
import "./App.css";
// Icons
import {
  SidebarIcon,
  SunIcon,
  MoonIcon,
  MenuIcon,
  XIcon,
} from "./components/icons";
// Auth
import { useAuth } from "./contexts/AuthContext";
import { ROLES } from "./constants/roles";
// Router
import AppRouter from "./router/AppRouter";
// Chatbot
import { ChatbotWidget } from "./components/specific/ChatbotWidget";

// ─── SidebarLink ────────────────────────────────────────────────────────────
const SidebarLink = ({ to, icon, label, onClick }) => (
  <RouterNavLink
    to={to}
    className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
    onClick={onClick}
  >
    <span className="nav-icon">{icon}</span>
    <span>{label}</span>
  </RouterNavLink>
);

// ─── Cấu hình menu chuẩn hóa theo 4 Vai trò ─────────────────────────────────────
const NAV_ITEMS = [
  {
    to: "/map",
    tab: "map",
    label: "Bản đồ Vận hành",
    roles: [ROLES.ADMIN, ROLES.DISPATCHER],
  },
  {
    to: "/staff",
    tab: "drivers",
    label: "Quản lý Nhân sự",
    roles: [ROLES.ADMIN],
  },
  {
    to: "/trips",
    tab: "active-vehicles",
    label: "Quản lý Chuyến đi",
    roles: [ROLES.ADMIN, ROLES.DISPATCHER],
  },
  {
    to: "/dispatch",
    tab: "map",
    label: "Điều phối Phương tiện & Tài xế",
    roles: [ROLES.ADMIN, ROLES.DISPATCHER],
  },
  {
    to: "/vehicles",
    tab: "vehicles",
    label: "Quản lý Xe",
    roles: [ROLES.ADMIN, ROLES.DISPATCHER],
  },
  {
    to: "/maintenance",
    tab: "vehicles",
    label: "Quản lý Bảo dưỡng",
    roles: [ROLES.ADMIN],
  },
  {
    to: "/depots",
    tab: "map",
    label: "Quản lý Bãi xe",
    roles: [ROLES.ADMIN, ROLES.DISPATCHER],
  },
  {
    to: "/drivers",
    tab: "drivers",
    label: "Quản lý Tài xế",
    roles: [ROLES.ADMIN, ROLES.DISPATCHER],
  },
  {
    to: "/driver-portal",
    tab: "active-vehicles",
    label: "Cổng Tài xế (Nhận/Giao xe)",
    roles: [ROLES.DRIVER],
  },
  {
    to: "/expense-approval",
    tab: "reports",
    label: "Duyệt Chi phí",
    roles: [ROLES.ADMIN, ROLES.ACCOUNTANT],
  },
  {
    to: "/reports",
    tab: "reports",
    label: "Báo cáo & Thống kê",
    roles: [ROLES.ADMIN, ROLES.ACCOUNTANT],
  },
];

// Label hiển thị thân thiện cho role
const ROLE_LABELS = {
  [ROLES.ADMIN]: "Quản trị viên",
  [ROLES.DISPATCHER]: "Điều phối viên",
  [ROLES.ACCOUNTANT]: "Kế toán",
  [ROLES.DRIVER]: "Tài xế",
};

// ─── Mock data defaults ──────────────────────────────────────────────────────
const MOCK_VEHICLES = [];
const MOCK_DRIVERS = [];
const MOCK_REPORTS = [];
const MOCK_CUSTOMERS = [];

// ─── App ─────────────────────────────────────────────────────────────────────
const App = () => {
  const { user, isAuthenticated, logout, hasRole } = useAuth();
  const navigate = useNavigate();

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Deep-link states
  const [vehicleToView, setVehicleToView] = useState(null);
  const [vehicleToManage, setVehicleToManage] = useState(null);
  const [activeVehicleDetailId, setActiveVehicleDetailId] = useState(null);

  // Data states
  const [vehicles, setVehicles] = useState(MOCK_VEHICLES);
  const [drivers, setDrivers] = useState(MOCK_DRIVERS);
  const [reports, setReports] = useState(MOCK_REPORTS);
  const [customers, setCustomers] = useState(MOCK_CUSTOMERS);

  // Fetch global data on authentication
  React.useEffect(() => {
    if (!isAuthenticated) return;

    const fetchGlobalData = async () => {
      try {
        const token = localStorage.getItem('authToken') || localStorage.getItem('token');
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        };

        const [drvRes, vehRes, custRes] = await Promise.all([
          fetch('http://localhost:5000/api/drivers', { headers }).then(r => r.ok ? r.json() : { data: [] }),
          fetch('http://localhost:5000/api/vehicles', { headers }).then(r => r.ok ? r.json() : { data: [] }),
          fetch('http://localhost:5000/api/customers', { headers }).then(r => r.ok ? r.json() : { data: [] })
        ]);

        if (drvRes.data) setDrivers(drvRes.data);
        if (vehRes.data) setVehicles(vehRes.data);
        if (custRes.data) setCustomers(custRes.data);
      } catch (err) {
        console.error('Error loading global data:', err);
      }
    };

    fetchGlobalData();
  }, [isAuthenticated]);

  // Dark mode
  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode((v) => !v);

  // Handlers
  const handleViewVehicleOnMap = (vehicleId) => {
    setVehicleToView(vehicleId);
    navigate("/map");
  };
  const handleManageVehicle = (vehicleId) => {
    setVehicleToManage(vehicleId);
    if (vehicleId) navigate("/vehicles");
  };
  const handleShowActiveVehicleDetail = (vehicleId) => {
    setActiveVehicleDetailId(vehicleId);
    if (vehicleId) navigate("/active-vehicles");
  };

  // Logout handler
  const handleLogout = () => {
    logout();
    setIsSidebarOpen(false);
    navigate("/login");
  };

  const visibleNavItems = NAV_ITEMS.filter((item) => hasRole(item.roles));

  const userRole = user?.role || user?.roles;
  const userRoleLabel =
    ROLE_LABELS[Array.isArray(userRole) ? userRole[0] : userRole] || userRole || "";

  const sidebarContent = (
    <div className="sidebar-content">
      <div className="sidebar-header">
        <h1 className="app-title">Futa Express</h1>
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="btn-close-sidebar"
        >
          <XIcon />
        </button>
      </div>

      {isAuthenticated && user && (
        <div className="user-profile-sidebar">
          <div>
            <div className="user-name-text">
              {user.fullName || user.name || user.username || user.email || "Người dùng"}
            </div>
            {userRoleLabel && (
              <div className="user-role-badge">
                {userRoleLabel}
              </div>
            )}
          </div>
          <button className="btn-logout-mini" onClick={handleLogout} title="Đăng xuất ngay">
            Đăng xuất
          </button>
        </div>
      )}

      <nav className="nav-menu">
        {visibleNavItems.map((item) => (
          <SidebarLink
            key={item.to}
            to={item.to}
            icon={<SidebarIcon tab={item.tab} />}
            label={item.label}
            onClick={() => setIsSidebarOpen(false)}
          />
        ))}
      </nav>

      <div className="sidebar-footer">
        <button onClick={toggleTheme} className="btn-theme-toggle">
          {isDarkMode ? <SunIcon /> : <MoonIcon />}
          <span style={{ marginLeft: "8px" }}>
            {isDarkMode ? "Chế độ Sáng" : "Chế độ Tối"}
          </span>
        </button>
        <button className="btn-logout-sidebar" onClick={handleLogout}>
          🚪 Đăng Xuất Hệ Thống
        </button>
      </div>
    </div>
  );

  return (
    <div className="laptop-frame">
      <div className="laptop-screen">
        <div className="app-container">
          {isAuthenticated && (
            <aside className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
              {sidebarContent}
            </aside>
          )}

          <div className="main-content">
            {isAuthenticated && (
              <header className="mobile-header">
                <h1 className="app-title" style={{ fontSize: "20px" }}>
                  Futa Express
                </h1>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="btn-menu"
                  >
                    <MenuIcon />
                  </button>
                  <button
                    className="btn-logout-mobile"
                    onClick={handleLogout}
                  >
                    Đăng xuất
                  </button>
                </div>
              </header>
            )}

            <main className="page-scroll-container">
              <AppRouter
                vehicles={vehicles}
                setVehicles={setVehicles}
                drivers={drivers}
                setDrivers={setDrivers}
                reports={reports}
                setReports={setReports}
                customers={customers}
                setCustomers={setCustomers}
                vehicleToView={vehicleToView}
                onMapVehicleViewed={() => setVehicleToView(null)}
                handleManageVehicle={handleManageVehicle}
                handleShowActiveVehicleDetail={handleShowActiveVehicleDetail}
                vehicleToManage={vehicleToManage}
                activeVehicleDetailId={activeVehicleDetailId}
                handleViewVehicleOnMap={handleViewVehicleOnMap}
              />
              <ChatbotWidget />
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
