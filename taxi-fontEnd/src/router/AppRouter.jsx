import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import { ROLES } from "../constants/roles";
import { useAuth } from "../contexts/AuthContext";

const RootRedirect = () => {
  const { getDefaultRoute } = useAuth();
  return <Navigate to={getDefaultRoute()} replace />;
};

// Pages
import Login from "../pages/Auth/Login";
import Unauthorized from "../pages/Auth/Unauthorized";
import OperationMap from "../pages/Dispatch/OperationMap";
import ActiveVehicles from "../pages/Dispatch/ActiveVehicles";
import VehicleList from "../pages/Vehicles/VehicleList";
import DriverList from "../pages/Drivers/DriverList";
import CustomerList from "../pages/Customers/CustomerList";
import Reports from "../pages/Reports/Reports";
import CheckBookingSchema from "../pages/Test/CheckBookingSchema";

// --- PHÂN QUYỀN ---
const ADMIN_DISPATCHER = [ROLES.ADMIN, ROLES.DISPATCHER];
const ADMIN_ACCOUNTANT = [ROLES.ADMIN, ROLES.ACCOUNTANT];
const ADMIN_ONLY = [ROLES.ADMIN];

// ĐÃ THÊM: Tạo nhóm quyền dành riêng cho tài khoản thường
// (Đảm bảo trong file constants/roles.js của bạn có khai báo thuộc tính USER hoặc CUSTOMER)
const USER_ONLY = [ROLES.USER, ROLES.CUSTOMER];

/**
 * AppRouter - Tập trung toàn bộ routing với phân quyền rõ ràng
 */
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

      {/* Bản đồ vận hành - ADMIN + DISPATCHER */}
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

      {/* Giám sát 24/24 - ADMIN + DISPATCHER */}
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

      {/* Quản lý xe - ADMIN + DISPATCHER */}
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

      {/* Quản lý tài xế - ADMIN + DISPATCHER */}
      <Route
        path="/drivers"
        element={
          <PrivateRoute roles={ADMIN_DISPATCHER}>
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

      {/* Khách hàng - ADMIN + DISPATCHER */}
      <Route
        path="/customers"
        element={
          <PrivateRoute roles={ADMIN_DISPATCHER}>
            <CustomerList
              customers={customers}
              setCustomers={setCustomers}
              vehicles={vehicles}
            />
          </PrivateRoute>
        }
      />

      {/* Báo cáo - ADMIN + ACCOUNTANT */}
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

      {/* ========================================================= */}
      {/* ĐÃ THÊM: GIAO DIỆN DÀNH CHO TÀI KHOẢN USER / KHÁCH HÀNG   */}
      {/* ========================================================= */}
      <Route
        path="/user-dashboard"
        element={
          <PrivateRoute roles={USER_ONLY}>
            {/* Tạm thời dùng thẻ div này để test. Sau này bạn import component màn hình User vào đây */}
            <div style={{ padding: "50px", textAlign: "center" }}>
              <h2 style={{ color: "#2563eb" }}>Xin chào Khách hàng!</h2>
              <p>
                Đây là khu vực hiển thị các chức năng đặt xe hoặc lịch sử chuyến
                đi của riêng bạn.
              </p>
            </div>
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
