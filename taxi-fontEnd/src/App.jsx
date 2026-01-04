import React, { useState, useEffect } from "react";
import {
  NavLink as RouterNavLink,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import "./App.css";
import BookingAPITester from "./pages/Test/BookingAPITester";
import CheckBookingSchema from "./pages/Test/CheckBookingSchema";
// 1. Import Icons & Components
import {
  SidebarIcon,
  SunIcon,
  MoonIcon,
  MenuIcon,
  XIcon,
} from "./components/icons";
import Login from "./pages/Auth/Login";

// 2. Import Pages (CHUYỂN TẤT CẢ IMPORT LÊN ĐẦU FILE)
import VehicleList from "./pages/Vehicles/VehicleList";
import DriverList from "./pages/Drivers/DriverList";
import OperationMap from "./pages/Dispatch/OperationMap";
import Reports from "./pages/Reports/Reports";
import ActiveVehicles from "./pages/Dispatch/ActiveVehicles";
import CustomerList from "./pages/Customers/CustomerList";

// 3. Khai báo Component phụ (Ở trên cùng hoặc tách file riêng)
// SidebarLink component
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

// PrivateRoute component
const PrivateRoute = ({ isAuthenticated, children }) => {
  if (isAuthenticated) return children;
  return <Navigate to="/login" replace />;
};

// Chatbot fallback
const Chatbot = () => {
  return null;
};

// Safe defaults
const MOCK_VEHICLES = [];
const MOCK_DRIVERS = [];
const MOCK_REPORTS = [];
const MOCK_CUSTOMERS = [];

const App = () => {
  // State
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Router hook
  const navigate = useNavigate();

  // State Deep link
  const [vehicleToView, setVehicleToView] = useState(null);
  const [vehicleToManage, setVehicleToManage] = useState(null);
  const [activeVehicleDetailId, setActiveVehicleDetailId] = useState(null);

  // State Data
  const [vehicles, setVehicles] = useState(MOCK_VEHICLES);
  const [drivers, setDrivers] = useState(MOCK_DRIVERS);
  const [reports, setReports] = useState(MOCK_REPORTS);
  const [customers, setCustomers] = useState(MOCK_CUSTOMERS);

  // Effect Dark Mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Handlers
  const handleViewVehicleOnMap = (vehicleId) => {
    setVehicleToView(vehicleId);
    navigate("/map");
  };

  const handleManageVehicle = (vehicleId) => {
    setVehicleToManage(vehicleId);
    navigate("/vehicles");
  };

  const handleShowActiveVehicleDetail = (vehicleId) => {
    setActiveVehicleDetailId(vehicleId);
    navigate("/active-vehicles");
  };

  // Sidebar Content
  const sidebarContent = (
    <div className="sidebar-content">
      <div className="sidebar-header">
        <h1 className="app-title">Smart Fleet AI</h1>
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="btn-close-sidebar"
        >
          <XIcon />
        </button>
      </div>

      <nav className="nav-menu">
        <SidebarLink
          to="/map"
          icon={<SidebarIcon tab="map" />}
          label="Bản đồ Vận hành"
          onClick={() => {
            setIsSidebarOpen(false);
            navigate("/map");
          }}
        />

        <SidebarLink
          to="/active-vehicles"
          icon={<SidebarIcon tab="active-vehicles" />}
          label="Giám sát 24/24"
          onClick={() => setIsSidebarOpen(false)}
        />
        <SidebarLink
          to="/vehicles"
          icon={<SidebarIcon tab="vehicles" />}
          label="Quản lý Xe"
          onClick={() => setIsSidebarOpen(false)}
        />
        <SidebarLink
          to="/drivers"
          icon={<SidebarIcon tab="drivers" />}
          label="Quản lý Tài xế"
          onClick={() => setIsSidebarOpen(false)}
        />
        <SidebarLink
          to="/customers"
          icon={<SidebarIcon tab="customers" />}
          label="Khách hàng"
          onClick={() => setIsSidebarOpen(false)}
        />
        <SidebarLink
          to="/reports"
          icon={<SidebarIcon tab="reports" />}
          label="Báo cáo"
          onClick={() => setIsSidebarOpen(false)}
        />
      </nav>

      <div className="theme-toggle-container">
        <button onClick={toggleTheme} className="btn-theme-toggle">
          {isDarkMode ? <SunIcon /> : <MoonIcon />}
          <span style={{ marginLeft: "12px" }}>
            {isDarkMode ? "Chế độ Sáng" : "Chế độ Tối"}
          </span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="laptop-frame">
      <div className="laptop-screen">
        <div className="app-container">
          <aside className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
            {sidebarContent}
            <div style={{ padding: "12px" }}>
              <button
                className="btn-logout"
                onClick={() => {
                  setIsAuthenticated(false);
                  setIsSidebarOpen(false);
                  navigate("/login");
                }}
              >
                Đăng xuất
              </button>
            </div>
          </aside>

          <div className="main-content">
            <header className="mobile-header">
              <h1 className="app-title" style={{ fontSize: "20px" }}>
                Smart Fleet AI
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
                  onClick={() => {
                    setIsAuthenticated(false);
                    setIsSidebarOpen(false);
                    navigate("/login");
                  }}
                >
                  Đăng xuất
                </button>
              </div>
            </header>

            <main className="page-scroll-container">
              <Routes>
                <Route
                  path="/login"
                  element={
                    isAuthenticated ? (
                      <Navigate to="/map" replace />
                    ) : (
                      <Login
                        onLogin={() => {
                          setIsAuthenticated(true);
                          navigate("/map");
                        }}
                      />
                    )
                  }
                />

                <Route
                  path="/"
                  element={
                    <PrivateRoute isAuthenticated={isAuthenticated}>
                      <Navigate to="/map" replace />
                    </PrivateRoute>
                  }
                />

                {/* ĐÂY LÀ ROUTE XỬ LÝ HIỂN THỊ TRANG OPERATION MAP */}
                <Route
                  path="/map"
                  element={
                    <PrivateRoute isAuthenticated={isAuthenticated}>
                      <OperationMap
                        vehicles={vehicles}
                        setVehicles={setVehicles}
                        drivers={drivers}
                        reports={reports}
                        vehicleToView={vehicleToView}
                        onMapVehicleViewed={() => setVehicleToView(null)}
                        onManageVehicle={handleManageVehicle}
                        onShowActiveVehicleDetail={
                          handleShowActiveVehicleDetail
                        }
                        customers={customers}
                        setCustomers={setCustomers}
                      />
                    </PrivateRoute>
                  }
                />

                <Route
                  path="/active-vehicles"
                  element={
                    <PrivateRoute isAuthenticated={isAuthenticated}>
                      <ActiveVehicles
                        vehicles={vehicles}
                        setVehicles={setVehicles}
                        drivers={drivers}
                        initialVehicleId={activeVehicleDetailId}
                        onClearInitialVehicleId={() =>
                          setActiveVehicleDetailId(null)
                        }
                        reports={reports}
                        onViewOnMap={handleViewVehicleOnMap}
                      />
                    </PrivateRoute>
                  }
                />

                <Route
                  path="/vehicles"
                  element={
                    <PrivateRoute isAuthenticated={isAuthenticated}>
                      <VehicleList
                        vehicles={vehicles}
                        setVehicles={setVehicles}
                        drivers={drivers}
                        onViewOnMap={handleViewVehicleOnMap}
                        reports={reports}
                        initialVehicleId={vehicleToManage}
                        onClearInitialVehicleId={() => setVehicleToManage(null)}
                      />
                    </PrivateRoute>
                  }
                />

                <Route
                  path="/drivers"
                  element={
                    <PrivateRoute isAuthenticated={isAuthenticated}>
                      <DriverList
                        drivers={drivers}
                        setDrivers={setDrivers}
                        vehicles={vehicles}
                        setVehicles={setVehicles}
                        onViewOnMap={handleViewVehicleOnMap}
                        reports={reports}
                      />
                    </PrivateRoute>
                  }
                />

                <Route
                  path="/customers"
                  element={
                    <PrivateRoute isAuthenticated={isAuthenticated}>
                      <CustomerList
                        customers={customers}
                        setCustomers={setCustomers}
                        vehicles={vehicles}
                      />
                    </PrivateRoute>
                  }
                />

                <Route
                  path="/reports"
                  element={
                    <PrivateRoute isAuthenticated={isAuthenticated}>
                      <Reports
                        reports={reports}
                        setReports={setReports}
                        drivers={drivers}
                        vehicles={vehicles}
                      />
                    </PrivateRoute>
                  }
                />
                <Route path="/check-schema" element={<CheckBookingSchema />} />

                <Route path="*" element={<div>Không tìm thấy trang</div>} />
              </Routes>
            </main>
          </div>
        </div>
      </div>
      <Chatbot />
    </div>
  );
};

export default App;
