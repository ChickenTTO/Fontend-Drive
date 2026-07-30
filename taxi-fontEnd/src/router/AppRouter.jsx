import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import { ROLES } from "../constants/roles";
import { useAuth } from "../contexts/AuthContext";

const RootRedirect = () => {
  const { getDefaultRoute } = useAuth();
  return <Navigate to={getDefaultRoute()} replace />;
};

// Pages gốc của bạn
import Login from "../pages/Auth/Login";
import Unauthorized from "../pages/Auth/Unauthorized";
import OperationMap from "../pages/Dispatch/OperationMap";
import ActiveVehicles from "../pages/Dispatch/ActiveVehicles";
import VehicleList from "../pages/Vehicles/VehicleList";
import DriverList from "../pages/Drivers/DriverList";
import CustomerList from "../pages/Customers/CustomerList";
import Reports from "../pages/Reports/Reports";
import CheckBookingSchema from "../pages/Test/CheckBookingSchema";

// Pages Futa Express bổ sung
import DepotList from "../pages/Vehicles/DepotList";
import FreightDispatch from "../pages/Dispatch/FreightDispatch";
import BarcodeHandover from "../pages/Drivers/BarcodeHandover";
import ExpenseApproval from "../pages/Accounting/ExpenseApproval";
import FutaDashboard from "../pages/Reports/FutaDashboard";

// --- PHÂN QUYỀN ---
const ADMIN_DISPATCHER = [ROLES.ADMIN, ROLES.DISPATCHER];
const ADMIN_ACCOUNTANT = [ROLES.ADMIN, ROLES.ACCOUNTANT];
const USER_ONLY = [ROLES.USER, ROLES.CUSTOMER];

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

      {/* Bản đồ vận hành - Form gốc */}
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

      {/* Giám sát 24/24 - Form gốc */}
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

      {/* Quản lý xe - Form gốc của bạn */}
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

      {/* Quản lý tài xế - Form gốc */}
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

      {/* Khách hàng - Form gốc */}
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

      {/* Báo cáo - Form gốc */}
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
      {/* CÁC CHỨC NĂNG FUTA EXPRESS (BỔ SUNG, KHÔNG ẢNH HƯỞNG FORM GỐC) */}
      {/* ========================================================= */}
      <Route
        path="/depots"
        element={
          <PrivateRoute roles={ALL_ROLES}>
            <DepotList />
          </PrivateRoute>
        }
      />
      <Route
        path="/dispatch-futa"
        element={
          <PrivateRoute roles={ADMIN_DISPATCHER}>
            <FreightDispatch />
          </PrivateRoute>
        }
      />
      <Route
        path="/barcode-handover"
        element={
          <PrivateRoute roles={HANDOVER_ROLES}>
            <BarcodeHandover />
          </PrivateRoute>
        }
      />
      <Route
        path="/expense-approval"
        element={
          <PrivateRoute roles={ACCOUNTING_ROLES}>
            <ExpenseApproval />
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

      {/* User / Khách hàng */}
      <Route
        path="/user-dashboard"
        element={
          <PrivateRoute roles={USER_ONLY}>
            <div style={{ padding: "50px", textAlign: "center" }}>
              <h2 style={{ color: "#2563eb" }}>Xin chào Khách hàng!</h2>
              <p>Khu vực lịch sử chuyến đi của riêng bạn.</p>
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
