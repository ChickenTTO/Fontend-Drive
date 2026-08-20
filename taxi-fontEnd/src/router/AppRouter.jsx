import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import { ROLES } from "../constants/roles";
import { useAuth } from "../contexts/AuthContext";

const RootRedirect = () => {
  const { getDefaultRoute } = useAuth();
  return <Navigate to={getDefaultRoute()} replace />;
};

// Pages gốc
import Login from "../pages/Auth/Login";
import Unauthorized from "../pages/Auth/Unauthorized";
import OperationMap from "../pages/Dispatch/OperationMap";
import ActiveVehicles from "../pages/Dispatch/ActiveVehicles";
import VehicleList from "../pages/Vehicles/VehicleList";
import DriverList from "../pages/Drivers/DriverList";
import CustomerList from "../pages/Customers/CustomerList";
import Reports from "../pages/Reports/Reports";
import CheckBookingSchema from "../pages/Test/CheckBookingSchema";

// Pages Futa Express bổ sung & chuẩn hóa 4 Role
import StaffList from "../pages/Staff/StaffList";
import MaintenanceLog from "../pages/Vehicles/MaintenanceLog";
import DriverPortal from "../pages/Drivers/DriverPortal";
import DepotList from "../pages/Vehicles/DepotList";
import TripManagement from "../pages/Dispatch/TripManagement";
import VehicleDispatch from "../pages/Dispatch/VehicleDispatch";
import BarcodeHandover from "../pages/Drivers/BarcodeHandover";
import ExpenseApproval from "../pages/Accounting/ExpenseApproval";
import FutaDashboard from "../pages/Reports/FutaDashboard";

// --- MA TRẬN PHÂN QUYỀN VAI TRÒ ---
const ADMIN_ONLY = [ROLES.ADMIN];
const ADMIN_DISPATCHER = [ROLES.ADMIN, ROLES.DISPATCHER];
const ADMIN_ACCOUNTANT = [ROLES.ADMIN, ROLES.ACCOUNTANT];
const DRIVER_ROLES = [ROLES.DRIVER];

const ALL_ROLES = [ROLES.ADMIN, ROLES.DISPATCHER, ROLES.DRIVER, ROLES.ACCOUNTANT];
const HANDOVER_ROLES = [ROLES.ADMIN, ROLES.DISPATCHER, ROLES.DRIVER];
const ACCOUNTING_ROLES = [ROLES.ADMIN, ROLES.ACCOUNTANT, ROLES.DRIVER];

const AppRouter = ({
  vehicles,
  setVehicles,
  drivers,
  setDrivers,
  reports,
  setReports,
  customers,
  setCustomers,
  vehicleToView,
  onMapVehicleViewed,
  handleManageVehicle,
  handleShowActiveVehicleDetail,
  vehicleToManage,
  activeVehicleDetailId,
  handleViewVehicleOnMap,
}) => {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Default redirect */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <RootRedirect />
          </PrivateRoute>
        }
      />

      {/* 👑 ADMIN ONLY: Quản lý Nhân sự */}
      <Route
        path="/staff"
        element={
          <PrivateRoute roles={ADMIN_ONLY}>
            <StaffList />
          </PrivateRoute>
        }
      />

      {/* 👑 ADMIN ONLY: Quản lý Bảo dưỡng phương tiện */}
      <Route
        path="/maintenance"
        element={
          <PrivateRoute roles={ADMIN_ONLY}>
            <MaintenanceLog />
          </PrivateRoute>
        }
      />

      {/* 👨‍✈️ DRIVER / ADMIN: Cổng thông tin Tài xế */}
      <Route
        path="/driver-portal"
        element={
          <PrivateRoute roles={DRIVER_ROLES}>
            <DriverPortal />
          </PrivateRoute>
        }
      />

      {/* Bản đồ vận hành - Admin & Dispatcher */}
      <Route
        path="/map"
        element={
          <PrivateRoute roles={ADMIN_DISPATCHER}>
            <OperationMap
              vehicles={vehicles}
              setVehicles={setVehicles}
              drivers={drivers}
              reports={reports}
              vehicleToView={vehicleToView}
              onMapVehicleViewed={onMapVehicleViewed}
              onManageVehicle={handleManageVehicle}
              onShowActiveVehicleDetail={handleShowActiveVehicleDetail}
              customers={customers}
              setCustomers={setCustomers}
            />
          </PrivateRoute>
        }
      />

      {/* Giám sát 24/24 */}
      <Route
        path="/active-vehicles"
        element={
          <PrivateRoute roles={ADMIN_DISPATCHER}>
            <ActiveVehicles
              vehicles={vehicles}
              setVehicles={setVehicles}
              drivers={drivers}
              initialVehicleId={activeVehicleDetailId}
              onClearInitialVehicleId={() =>
                handleShowActiveVehicleDetail(null)
              }
              reports={reports}
              onViewOnMap={handleViewVehicleOnMap}
            />
          </PrivateRoute>
        }
      />

      {/* Quản lý xe */}
      <Route
        path="/vehicles"
        element={
          <PrivateRoute roles={ADMIN_DISPATCHER}>
            <VehicleList
              vehicles={vehicles}
              setVehicles={setVehicles}
              drivers={drivers}
              onViewOnMap={handleViewVehicleOnMap}
              reports={reports}
              initialVehicleId={vehicleToManage}
              onClearInitialVehicleId={() => handleManageVehicle(null)}
            />
          </PrivateRoute>
        }
      />

      {/* Redirect /drivers sang /staff (Quản lý nhân sự) */}
      <Route path="/drivers" element={<Navigate to="/staff" replace />} />

      {/* Quản lý Bãi xe */}
      <Route
        path="/depots"
        element={
          <PrivateRoute roles={ADMIN_DISPATCHER}>
            <DepotList />
          </PrivateRoute>
        }
      />

      {/* Quản lý Chuyến đi */}
      <Route
        path="/trips"
        element={
          <PrivateRoute roles={ADMIN_DISPATCHER}>
            <TripManagement />
          </PrivateRoute>
        }
      />

      {/* Điều phối Phương tiện & Tài xế */}
      <Route
        path="/dispatch"
        element={
          <PrivateRoute roles={ADMIN_DISPATCHER}>
            <VehicleDispatch />
          </PrivateRoute>
        }
      />
      <Route
        path="/dispatch-futa"
        element={
          <PrivateRoute roles={ADMIN_DISPATCHER}>
            <VehicleDispatch />
          </PrivateRoute>
        }
      />

      {/* Bàn giao Barcode */}
      <Route
        path="/barcode-handover"
        element={
          <PrivateRoute roles={HANDOVER_ROLES}>
            <BarcodeHandover />
          </PrivateRoute>
        }
      />

      {/* Duyệt Chi phí - Accountant & Admin */}
      <Route
        path="/expense-approval"
        element={
          <PrivateRoute roles={ADMIN_ACCOUNTANT}>
            <ExpenseApproval />
          </PrivateRoute>
        }
      />

      {/* Báo cáo thống kê & Xuất file - Accountant & Admin */}
      <Route
        path="/reports"
        element={
          <PrivateRoute roles={ADMIN_ACCOUNTANT}>
            <Reports
              reports={reports}
              setReports={setReports}
              drivers={drivers}
              vehicles={vehicles}
            />
          </PrivateRoute>
        }
      />

      <Route
        path="/dashboard-futa"
        element={
          <PrivateRoute roles={ADMIN_ACCOUNTANT}>
            <FutaDashboard />
          </PrivateRoute>
        }
      />

      {/* Test/dev route */}
      <Route path="/check-schema" element={<CheckBookingSchema />} />

      {/* Fallback */}
      <Route
        path="*"
        element={
          <div style={{ padding: 40, textAlign: "center" }}>
            404 - Không tìm thấy trang
          </div>
        }
      />
    </Routes>
  );
};

export default AppRouter;
