import React, { useState, useEffect, useRef, useCallback } from "react";
import "./OperationMap.css"; // Import CSS file
import { MOCK_ASSIGNMENTS } from "../../constants"; // Giả định đường dẫn
import {
  StatusIcon,
  PackageIcon,
  UserCircleIcon,
  ArrowLeftIcon,
  PencilIcon,
  ChatIcon,
} from "../../components/icons"; // Giả định đường dẫn

const initialNewAssignmentState = {
  type: "customer",
  customerName: "",
  customerPhone: "",
  pickupAddress: "",
  destinationAddress: "",
  recipientName: "",
  recipientPhone: "",
  price: 0,
  pickupTime: "",
};

// Helper: Lấy 08:00 AM ngày mai
const getDefaultPickupTime = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(8, 0, 0, 0);

  const year = tomorrow.getFullYear();
  const month = String(tomorrow.getMonth() + 1).padStart(2, "0");
  const day = String(tomorrow.getDate()).padStart(2, "0");
  const hours = String(tomorrow.getHours()).padStart(2, "0");
  const minutes = String(tomorrow.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const OperationMap = ({
  vehicles,
  setVehicles,
  drivers,
  reports,
  vehicleToView,
  onMapVehicleViewed,
  onManageVehicle,
  onShowActiveVehicleDetail,
  customers,
  setCustomers,
}) => {
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [assignmentsForRoutes, setAssignmentsForRoutes] = useState([]);
  const [assignments, setAssignments] = useState(MOCK_ASSIGNMENTS);

  const [newAssignment, setNewAssignment] = useState({
    ...initialNewAssignmentState,
    pickupTime: getDefaultPickupTime(),
  });

  const [editingAssignmentId, setEditingAssignmentId] = useState(null);
  const [draggedAssignmentId, setDraggedAssignmentId] = useState(null);

  // State tìm kiếm địa điểm
  const [pickupQuery, setPickupQuery] = useState("");
  const [destinationQuery, setDestinationQuery] = useState("");
  const [pickupResults, setPickupResults] = useState([]);
  const [destinationResults, setDestinationResults] = useState([]);
  const [isPickupSearching, setIsPickupSearching] = useState(false);
  const [isDestinationSearching, setIsDestinationSearching] = useState(false);

  // State chọn Tài xế
  const [driverQuery, setDriverQuery] = useState("");
  const [showDriverSuggestions, setShowDriverSuggestions] = useState(false);
  const [selectedDriverForAssignment, setSelectedDriverForAssignment] =
    useState(null);

  const searchTimeoutRef = useRef(null);

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);
  const selectedDriver = selectedVehicle
    ? drivers.find((d) => d.id === selectedVehicle.driverId)
    : null;

  // 👉 Khai báo hàm trước khi dùng trong useEffect
  const handleVehicleSelect = useCallback(
    (vehicleId) => {
      setSelectedVehicleId(vehicleId);
      const vehicle = vehicles.find((v) => v.id === vehicleId);
      if (vehicle && vehicle.assignments && vehicle.assignments.length > 0) {
        setAssignmentsForRoutes(vehicle.assignments);
      } else {
        setAssignmentsForRoutes([]);
      }
    },
    [vehicles]
  );

  // Effect: khi có vehicleToView thì gọi hàm
  useEffect(() => {
    if (vehicleToView) {
      handleVehicleSelect(vehicleToView);
      onMapVehicleViewed();
    }
  }, [vehicleToView, onMapVehicleViewed]);

  useEffect(() => {
    console.log("OperationMap mounted");
    return () => console.log("OperationMap unmounted");
  }, []);

  useEffect(() => {
    console.log("OperationMap mounted");
    return () => console.log("OperationMap unmounted");
  }, []);

  const handleBackToDispatch = () => {
    setSelectedVehicleId(null);
    setAssignmentsForRoutes([]);
  };

  const handleAssignmentClick = (assignment) => {
    setAssignmentsForRoutes((prev) => {
      const isSelected = prev.some((a) => a.id === assignment.id);
      if (isSelected) {
        return prev.filter((a) => a.id !== assignment.id);
      }
      return [...prev, assignment];
    });
  };

  const handleEditAssignment = (assignment, e) => {
    e.stopPropagation();
    setEditingAssignmentId(assignment.id);
    setNewAssignment({
      type: assignment.type,
      customerName: assignment.customerName,
      customerPhone: assignment.customerPhone,
      pickupLocation: assignment.pickupLocation,
      destinationLocation: assignment.destinationLocation,
      recipientName: assignment.recipientName,
      recipientPhone: assignment.recipientPhone,
      price: assignment.price,
      pickupTime: assignment.pickupTime || getDefaultPickupTime(),
    });
    setPickupQuery(assignment.pickupAddress);
    setDestinationQuery(assignment.destinationAddress);

    // Pre-fill driver
    const currentVehicle = vehicles.find((v) =>
      v.assignments?.some((a) => a.id === assignment.id)
    );
    const currentDriver = currentVehicle
      ? drivers.find((d) => d.id === currentVehicle.driverId)
      : null;
    if (currentDriver) {
      setDriverQuery(currentDriver.name);
      setSelectedDriverForAssignment(currentDriver);
    } else {
      setDriverQuery("");
      setSelectedDriverForAssignment(null);
    }
  };

  const handleSaveAssignment = () => {
    if (
      !newAssignment.customerName ||
      !newAssignment.customerPhone ||
      !newAssignment.pickupLocation ||
      !newAssignment.destinationLocation
    ) {
      alert(
        "Vui lòng điền đầy đủ thông tin khách hàng (tên, SĐT) và chọn điểm đi/đến từ gợi ý."
      );
      return;
    }

    const assignmentId = editingAssignmentId || `a${Date.now()}`;

    // Auto-save Customer
    if (newAssignment.customerName && newAssignment.customerPhone) {
      const existingCustomer = customers.find(
        (c) => c.phone === newAssignment.customerPhone
      );
      if (!existingCustomer) {
        const newCustomer = {
          id: `c${Date.now()}`,
          name: newAssignment.customerName,
          phone: newAssignment.customerPhone,
          type: "regular",
          address: pickupQuery || "",
        };
        setCustomers((prev) => [...prev, newCustomer]);
      }
    }

    const status = selectedDriverForAssignment ? "assigned" : "pending";

    const finalAssignment = {
      id: assignmentId,
      status: status,
      ...newAssignment,
      pickupAddress: pickupQuery,
      destinationAddress: destinationQuery,
    };

    // Cập nhật Vehicles: Xóa khỏi xe cũ, thêm vào xe mới nếu có driver
    let updatedVehicles = vehicles.map((v) => ({
      ...v,
      assignments: v.assignments?.filter((a) => a.id !== assignmentId) || [],
    }));

    if (selectedDriverForAssignment && selectedDriverForAssignment.vehicleId) {
      updatedVehicles = updatedVehicles.map((v) => {
        if (v.id === selectedDriverForAssignment.vehicleId) {
          return {
            ...v,
            assignments: [...(v.assignments || []), finalAssignment],
          };
        }
        return v;
      });
    }
    setVehicles(updatedVehicles);

    if (editingAssignmentId) {
      setAssignments((prev) =>
        prev.map((a) => (a.id === assignmentId ? finalAssignment : a))
      );
      setAssignmentsForRoutes((prev) =>
        prev.map((a) => (a.id === assignmentId ? finalAssignment : a))
      );
    } else {
      setAssignments((prev) => [...prev, finalAssignment]);
    }

    handleResetForm();
  };

  const handleResetForm = () => {
    setNewAssignment({
      ...initialNewAssignmentState,
      pickupTime: getDefaultPickupTime(),
    });
    setPickupQuery("");
    setDestinationQuery("");
    setEditingAssignmentId(null);
    setDriverQuery("");
    setSelectedDriverForAssignment(null);
    setShowDriverSuggestions(false);
  };

  const handleCancelEdit = () => {
    handleResetForm();
  };

  const handleDragStart = (e, assignmentId) => {
    setDraggedAssignmentId(assignmentId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleDrop = (e, vehicleId) => {
    e.preventDefault();
    if (!draggedAssignmentId) return;

    const assignment = assignments.find((a) => a.id === draggedAssignmentId);
    if (!assignment) return;

    setVehicles((prevVehicles) =>
      prevVehicles.map((v) =>
        v.id === vehicleId
          ? {
              ...v,
              assignments: [
                ...(v.assignments || []),
                { ...assignment, status: "assigned" },
              ],
            }
          : v
      )
    );

    setAssignments((prevAssignments) =>
      prevAssignments.map((a) =>
        a.id === draggedAssignmentId ? { ...a, status: "assigned" } : a
      )
    );

    setDraggedAssignmentId(null);
  };

  const searchLocation = async (query, type) => {
    if (query.length < 3) {
      type === "pickup" ? setPickupResults([]) : setDestinationResults([]);
      return;
    }

    type === "pickup"
      ? setIsPickupSearching(true)
      : setIsDestinationSearching(true);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&countrycodes=vn&limit=5`
      );
      const data = await response.json();
      type === "pickup" ? setPickupResults(data) : setDestinationResults(data);
    } catch (error) {
      console.error("Failed to fetch location:", error);
    } finally {
      type === "pickup"
        ? setIsPickupSearching(false)
        : setIsDestinationSearching(false);
    }
  };

  const handleQueryChange = (e, type) => {
    const query = e.target.value;
    type === "pickup" ? setPickupQuery(query) : setDestinationQuery(query);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchLocation(query, type);
    }, 500);
  };

  const handleSelectResult = (result, type) => {
    const location = {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
    };
    const locationKey =
      type === "pickup" ? "pickupLocation" : "destinationLocation";

    setNewAssignment((prev) => ({ ...prev, [locationKey]: location }));

    if (type === "pickup") {
      setPickupQuery(result.display_name);
      setPickupResults([]);
    } else {
      setDestinationQuery(result.display_name);
      setDestinationResults([]);
    }
  };

  const handleDriverInputBlur = () => {
    setTimeout(() => setShowDriverSuggestions(false), 200);
  };

  const handleSelectDriver = (driver) => {
    setSelectedDriverForAssignment(driver);
    setDriverQuery(driver.name);
    setShowDriverSuggestions(false);
  };

  const getDriverName = (driverId) =>
    drivers.find((d) => d.id === driverId)?.name || "Chưa gán";

  const getRevenueAndTripsStats = (vehicleId) => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const vehicleReports = reports.filter((r) => r.vehicleId === vehicleId);

    let monthRevenue = vehicleReports
      .filter((r) => {
        const d = new Date(r.date);
        return (
          d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear
        );
      })
      .reduce((sum, r) => sum + r.revenue, 0);

    const vehicle = vehicles.find((v) => v.id === vehicleId);
    if (vehicle && vehicle.assignments) {
      vehicle.assignments.forEach((a) => {
        if (a.status === "completed" && a.price) {
          const tripDate = a.pickupTime ? new Date(a.pickupTime) : new Date();
          if (
            tripDate.getMonth() + 1 === currentMonth &&
            tripDate.getFullYear() === currentYear
          ) {
            monthRevenue += a.price;
          }
        }
      });
    }

    let todayRevenue = 0;
    let todayTrips = 0;

    if (vehicle && vehicle.assignments) {
      const completedAssignments = vehicle.assignments.filter(
        (a) => a.status === "completed"
      );
      todayRevenue = completedAssignments.reduce(
        (sum, a) => sum + (a.price || 0),
        0
      );

      vehicle.assignments.forEach((a) => {
        if (
          [
            "assigned",
            "called",
            "in-progress",
            "completed",
            "incident",
          ].includes(a.status)
        ) {
          todayTrips += 1;
        }
      });
    }

    return { monthRevenue, todayRevenue, todayTrips };
  };

  const unassignedJobs = assignments.filter((a) => a.status === "pending");
  const onlineVehicles = vehicles.filter(
    (v) => v.driverId && v.status !== "maintenance"
  );

  const availableDrivers = drivers.filter((d) => d.vehicleId);
  const filteredDrivers = availableDrivers.filter((d) =>
    d.name.toLowerCase().includes(driverQuery.toLowerCase())
  );

  const renderSearchResult = (results, isLoading, onSelect) =>
    (isLoading || results.length > 0) && (
      <div className="search-results-dropdown">
        {isLoading && (
          <div style={{ padding: "8px", fontSize: "12px", color: "#6b7280" }}>
            Đang tìm...
          </div>
        )}
        {!isLoading &&
          results.map((result) => (
            <div
              key={`${result.lat}-${result.lon}`}
              onClick={() => onSelect(result)}
              className="search-result-item"
            >
              {result.display_name}
            </div>
          ))}
      </div>
    );

  const handleCancelAssignment = (assignmentId) => {
    setAssignments((prev) => prev.filter((a) => a.id !== assignmentId));
    setAssignmentsForRoutes((prev) =>
      prev.filter((a) => a.id !== assignmentId)
    );
    setVehicles((prev) =>
      prev.map((v) => {
        if (v.assignments) {
          return {
            ...v,
            assignments: v.assignments.filter((a) => a.id !== assignmentId),
          };
        }
        return v;
      })
    );
    if (editingAssignmentId === assignmentId) handleCancelEdit();
  };

  const handleUpdateStatus = (assignmentId, newStatus) => {
    const now = new Date().toISOString();
    const update = (a) => {
      const updates = { status: newStatus };
      if (newStatus === "in-progress" && !a.startTime) {
        updates.startTime = now;
      }
      if (newStatus === "completed") {
        updates.endTime = now;
      }
      return { ...a, ...updates };
    };

    setAssignments((prev) =>
      prev.map((a) => (a.id === assignmentId ? update(a) : a))
    );
    setVehicles((prev) =>
      prev.map((v) => {
        if (v.assignments) {
          return {
            ...v,
            assignments: v.assignments.map((a) =>
              a.id === assignmentId ? update(a) : a
            ),
          };
        }
        return v;
      })
    );
    setAssignmentsForRoutes((prev) =>
      prev.map((a) => (a.id === assignmentId ? update(a) : a))
    );
  };

  const renderAssignmentCard = (assignment, isDraggable) => {
    const isSelected = assignmentsForRoutes.some((a) => a.id === assignment.id);
    const isPending = assignment.status === "pending";
    const isCompleted = assignment.status === "completed";

    const getStatusLabel = (status) => {
      switch (status) {
        case "pending":
          return "Pending";
        case "assigned":
          return "Đã gán";
        case "called":
          return "Đã gọi";
        case "in-progress":
          return "Đã đón";
        case "incident":
          return "Sự cố";
        case "completed":
          return "Hoàn thành";
        default:
          return status;
      }
    };

    return (
      <div
        key={assignment.id}
        draggable={isDraggable}
        onDragStart={(e) => isDraggable && handleDragStart(e, assignment.id)}
        onClick={() => handleAssignmentClick(assignment)}
        className={`assignment-card ${isSelected ? "selected" : ""} ${
          isDraggable ? "draggable" : ""
        }`}
      >
        <div className="ac-header">
          <div className="ac-customer">
            {assignment.type === "cargo" ? <PackageIcon /> : <UserCircleIcon />}
            <span
              style={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "120px",
              }}
            >
              {assignment.customerName}
            </span>
          </div>
          <div className="ac-status">
            {isPending && isDraggable && (
              <button
                onClick={(e) => handleEditAssignment(assignment, e)}
                className="btn-icon-edit"
                title="Chỉnh sửa"
              >
                <PencilIcon />
              </button>
            )}
            <span className={`badge ${assignment.status}`}>
              {getStatusLabel(assignment.status)}
            </span>
          </div>
        </div>
        <div className="ac-details">
          <p>
            <span className="label">Từ:</span> {assignment.pickupAddress}
          </p>
          <p>
            <span className="label">Đến:</span> {assignment.destinationAddress}
          </p>
          {assignment.pickupTime && (
            <p>
              <span className="label">Giờ:</span>{" "}
              {new Date(assignment.pickupTime).toLocaleString("vi-VN")}
            </p>
          )}
          {assignment.price ? (
            <p className="ac-price">
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(assignment.price)}
            </p>
          ) : null}
        </div>

        <div className="ac-actions">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCancelAssignment(assignment.id);
            }}
            className="btn-small btn-red"
          >
            Huỷ
          </button>

          {!isPending && !isCompleted && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleUpdateStatus(assignment.id, "called");
                }}
                className="btn-small btn-teal"
              >
                Đã gọi khách
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleUpdateStatus(assignment.id, "in-progress");
                }}
                className="btn-small btn-blue"
              >
                Đã đón khách
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleUpdateStatus(assignment.id, "incident");
                }}
                className="btn-small btn-orange"
              >
                Có sự cố
              </button>
            </>
          )}

          {!isCompleted && !isPending && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleUpdateStatus(assignment.id, "completed");
              }}
              className="btn-small btn-green"
            >
              Hoàn thành
            </button>
          )}
        </div>
      </div>
    );
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);

  const MapEmbed = ({ vehicles }) => {
    // Center on avg coords or fallback to HCMC
    const defaultCenter = { lat: 10.776944, lng: 106.700981 }; // Ho Chi Minh center
    const center =
      vehicles && vehicles.length > 0
        ? vehicles.reduce(
            (acc, v) => ({
              lat: acc.lat + v.location.lat,
              lng: acc.lng + v.location.lng,
            }),
            { lat: 0, lng: 0 }
          )
        : null;
    let lat = defaultCenter.lat;
    let lng = defaultCenter.lng;
    if (center) {
      lat = center.lat / vehicles.length;
      lng = center.lng / vehicles.length;
    }
    const delta = 0.05;
    const left = lng - delta;
    const right = lng + delta;
    const top = lat + delta;
    const bottom = lat - delta;
    const src = `https://www.openstreetmap.org/export/embed.html?bbox=${left}%2C${bottom}%2C${right}%2C${top}&layer=mapnik&marker=${lat}%2C${lng}`;
    return <iframe title="map" className="map-iframe" src={src}></iframe>;
  };

  return (
    <div className="operation-map-container">
      {/* Cột 1: Form tạo chuyến */}
      <div className="op-panel">
        <div className="op-panel-header">
          <h2>{editingAssignmentId ? "Chỉnh sửa" : "Tạo Chuyến đi"}</h2>
          <button onClick={handleResetForm} className="btn-link">
            {editingAssignmentId ? "Hủy bỏ" : "Làm mới"}
          </button>
        </div>
        <div className="op-panel-body">
          <div className="form-stack">
            <input
              type="text"
              placeholder="Tên khách hàng"
              value={newAssignment.customerName || ""}
              onChange={(e) =>
                setNewAssignment((p) => ({
                  ...p,
                  customerName: e.target.value,
                }))
              }
              className="form-input"
            />
            <input
              type="tel"
              placeholder="SĐT khách hàng"
              value={newAssignment.customerPhone || ""}
              onChange={(e) =>
                setNewAssignment((p) => ({
                  ...p,
                  customerPhone: e.target.value,
                }))
              }
              className="form-input"
            />

            <div className="input-wrapper">
              <input
                type="text"
                placeholder="Điểm đi (Tìm kiếm...)"
                value={pickupQuery}
                onChange={(e) => handleQueryChange(e, "pickup")}
                className="form-input"
              />
              {renderSearchResult(pickupResults, isPickupSearching, (result) =>
                handleSelectResult(result, "pickup")
              )}
            </div>

            <div className="input-wrapper">
              <input
                type="text"
                placeholder="Điểm đến (Tìm kiếm...)"
                value={destinationQuery}
                onChange={(e) => handleQueryChange(e, "destination")}
                className="form-input"
              />
              {renderSearchResult(
                destinationResults,
                isDestinationSearching,
                (result) => handleSelectResult(result, "destination")
              )}
            </div>

            <select
              value={newAssignment.type}
              onChange={(e) =>
                setNewAssignment((p) => ({ ...p, type: e.target.value }))
              }
              className="form-select"
            >
              <option value="customer">Chở khách</option>
              <option value="cargo">Giao hàng</option>
            </select>

            <div className="input-wrapper">
              <input
                type="number"
                list="price-suggestions"
                placeholder="Giá tiền (VNĐ)"
                value={newAssignment.price || ""}
                onChange={(e) =>
                  setNewAssignment((p) => ({
                    ...p,
                    price: parseInt(e.target.value) || 0,
                  }))
                }
                className="form-input"
              />
              <datalist id="price-suggestions">
                <option value="100000" label="100.000 VNĐ"></option>
                <option value="200000" label="200.000 VNĐ"></option>
                <option value="500000" label="500.000 VNĐ"></option>
              </datalist>
            </div>

            <div>
              <label
                style={{
                  fontSize: "12px",
                  color: "#6b7280",
                  marginBottom: "4px",
                  display: "block",
                }}
              >
                Thời gian đón
              </label>
              <input
                type="datetime-local"
                value={newAssignment.pickupTime || ""}
                onChange={(e) =>
                  setNewAssignment((p) => ({
                    ...p,
                    pickupTime: e.target.value,
                  }))
                }
                className="form-input"
              />
            </div>

            {newAssignment.type === "cargo" && (
              <div className="input-group-row">
                <input
                  type="text"
                  placeholder="Tên người nhận"
                  value={newAssignment.recipientName || ""}
                  onChange={(e) =>
                    setNewAssignment((p) => ({
                      ...p,
                      recipientName: e.target.value,
                    }))
                  }
                  className="form-input"
                />
                <input
                  type="text"
                  placeholder="SĐT người nhận"
                  value={newAssignment.recipientPhone || ""}
                  onChange={(e) =>
                    setNewAssignment((p) => ({
                      ...p,
                      recipientPhone: e.target.value,
                    }))
                  }
                  className="form-input"
                />
              </div>
            )}

            <div className="input-wrapper">
              <input
                type="text"
                placeholder="Lái xe (Tùy chọn - Tự động gán)"
                value={driverQuery}
                onChange={(e) => {
                  setDriverQuery(e.target.value);
                  if (
                    selectedDriverForAssignment &&
                    e.target.value !== selectedDriverForAssignment.name
                  ) {
                    setSelectedDriverForAssignment(null);
                  }
                }}
                onFocus={() => setShowDriverSuggestions(true)}
                onBlur={handleDriverInputBlur}
                className="form-input"
              />
              {showDriverSuggestions && filteredDrivers.length > 0 && (
                <div className="search-results-dropdown">
                  {filteredDrivers.map((driver) => (
                    <div
                      key={driver.id}
                      onMouseDown={() => handleSelectDriver(driver)}
                      className="search-result-item"
                    >
                      {driver.name} -{" "}
                      {vehicles.find((v) => v.id === driver.vehicleId)
                        ?.licensePlate || "N/A"}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button onClick={handleSaveAssignment} className="btn-primary">
              {editingAssignmentId ? "Lưu thay đổi" : "Tạo mới"}
            </button>
          </div>
        </div>
      </div>

      {/* Cột 2: Danh sách chờ */}
      <div className="op-panel">
        <div className="op-panel-header">
          <h2>Lấy thông tin khác</h2>
        </div>
        <div className="op-panel-body">
          <h3
            style={{ fontWeight: 600, color: "#374151", margin: "0 0 12px 0" }}
          >
            Chuyến đi chờ gán ({unassignedJobs.length})
          </h3>
          {unassignedJobs.length > 0 ? (
            <div className="form-stack">
              {unassignedJobs.map((a) => renderAssignmentCard(a, true))}
            </div>
          ) : (
            <p
              style={{
                fontStyle: "italic",
                textAlign: "center",
                color: "#6b7280",
                padding: "16px",
              }}
            >
              Không có chuyến đi nào đang chờ.
            </p>
          )}
        </div>
      </div>

      {/* Cột 3: Xe hoạt động / Chi tiết xe */}
      <div className="op-panel">
        {selectedVehicle ? (
          <div
            style={{ display: "flex", flexDirection: "column", height: "100%" }}
          >
            <div className="op-panel-header">
              <div className="detail-title">
                <button onClick={handleBackToDispatch} className="btn-back">
                  <ArrowLeftIcon />
                </button>
                <h2
                  style={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  Chi tiết: {selectedVehicle.licensePlate}
                </h2>
              </div>
              <button
                onClick={() => onManageVehicle(selectedVehicle.id)}
                className="btn-manage"
              >
                Quản lý xe
              </button>
            </div>
            <div className="op-panel-body">
              <div className="stats-grid">
                <div className="stat-box green">
                  <p className="title">DT Hôm nay</p>
                  <p className="val">
                    {formatCurrency(
                      getRevenueAndTripsStats(selectedVehicle.id).todayRevenue
                    )}
                  </p>
                </div>
                <div className="stat-box blue">
                  <p className="title">DT Tháng {new Date().getMonth() + 1}</p>
                  <p className="val">
                    {formatCurrency(
                      getRevenueAndTripsStats(selectedVehicle.id).monthRevenue
                    )}
                  </p>
                </div>
              </div>

              <div className="driver-info-box">
                <div className="driver-top">
                  <div>
                    <p style={{ marginBottom: "4px" }}>
                      Tài xế:{" "}
                      <span style={{ fontWeight: 500 }}>
                        {selectedDriver?.name || "Chưa gán"}
                      </span>
                    </p>
                    {selectedDriver?.phone && (
                      <p style={{ color: "#6b7280", fontSize: "12px" }}>
                        {selectedDriver.phone}
                      </p>
                    )}
                  </div>
                  {selectedDriver && (
                    <a
                      href={`https://zalo.me/${selectedDriver.phone.replace(
                        /\D/g,
                        ""
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-zalo"
                    >
                      <ChatIcon />
                      <span>Chat Zalo</span>
                    </a>
                  )}
                </div>
                <div
                  style={{ borderTop: "1px solid #e5e7eb", paddingTop: "8px" }}
                >
                  <p>Loại xe: {selectedVehicle.type}</p>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginTop: "4px",
                    }}
                  >
                    Trạng thái: <StatusIcon status={selectedVehicle.status} />{" "}
                    <span style={{ textTransform: "capitalize" }}>
                      {selectedVehicle.status}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4
                  style={{
                    fontWeight: "bold",
                    marginBottom: "8px",
                    color: "#374151",
                  }}
                >
                  Chuyến đã gán ({selectedVehicle.assignments?.length || 0})
                </h4>
                <div className="form-stack">
                  {selectedVehicle.assignments &&
                  selectedVehicle.assignments.length > 0 ? (
                    selectedVehicle.assignments.map((a) =>
                      renderAssignmentCard(a, false)
                    )
                  ) : (
                    <p
                      style={{
                        fontSize: "14px",
                        fontStyle: "italic",
                        color: "#6b7280",
                      }}
                    >
                      Chưa có chuyến nào.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", height: "100%" }}
          >
            <div className="op-panel-header">
              <h2>Xe đang hoạt động</h2>
            </div>
            <div className="op-panel-body" onDragOver={handleDragOver}>
              {/* Small map view showing all online vehicles */}
              <div style={{ marginBottom: 12 }}>
                <MapEmbed vehicles={onlineVehicles} />
              </div>

              <h3
                style={{
                  fontWeight: 600,
                  color: "#374151",
                  margin: "0 0 12px 0",
                }}
              >
                Danh sách ({onlineVehicles.length})
              </h3>
              <p
                style={{
                  fontSize: "12px",
                  color: "#6b7280",
                  marginBottom: "8px",
                }}
              >
                Kéo thả chuyến đi vào xe để gán.
              </p>
              <div className="form-stack">
                {onlineVehicles.map((v) => (
                  <div
                    key={v.id}
                    onDrop={(e) => handleDrop(e, v.id)}
                    onClick={() => onShowActiveVehicleDetail(v.id)}
                    className="vehicle-item"
                  >
                    <div className="v-header">
                      <p className="v-plate">{v.licensePlate}</p>
                      <div className="v-status">
                        <StatusIcon status={v.status} />
                        <span style={{ textTransform: "capitalize" }}>
                          {v.status}
                        </span>
                      </div>
                    </div>
                    <p className="v-driver">TX: {getDriverName(v.driverId)}</p>
                    <div className="v-stats">
                      <div className="v-stat-col border-r">
                        <p className="v-stat-label">Doanh thu ngày</p>
                        <p className="v-stat-val green">
                          {formatCurrency(
                            getRevenueAndTripsStats(v.id).todayRevenue
                          )}
                        </p>
                      </div>
                      <div className="v-stat-col">
                        <p className="v-stat-label">Số khách</p>
                        <p className="v-stat-val">
                          {v.assignments?.length || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {onlineVehicles.length === 0 && (
                  <p
                    style={{
                      fontStyle: "italic",
                      textAlign: "center",
                      color: "#6b7280",
                    }}
                  >
                    Không có xe đang hoạt động.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OperationMap;
