src/
├── api/                        # Chứa các file gọi API (Backend bạn đã làm)
│   ├── axiosClient.js          # Cấu hình Axios (base URL, interceptors, token header)
│   ├── authApi.js              # API login, logout, đổi pass
│   ├── bookingApi.js           # API đặt chuyến, điều phối
│   ├── driverApi.js            # API quản lý tài xế, lịch làm việc
│   ├── vehicleApi.js           # API xe, bảo dưỡng, bàn giao
│   ├── accountingApi.js        # API nộp tiền, chi phí, báo cáo
│   └── customerApi.js          # API khách hàng
│
├── assets/                     # Tài nguyên tĩnh
│   ├── images/                 # Logo, hình placeholder
│   └── styles/                 # CSS global
│
├── components/                 # Các thành phần giao diện nhỏ (Dùng chung)
│   ├── common/                 # Các component cơ bản
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Modal.jsx           # Modal dùng rất nhiều (Form sửa, xác nhận)
│   │   ├── Table.jsx           # Table hiển thị danh sách (xe, tài xế, chuyến)
│   │   └── Pagination.jsx
│   ├── layout/                 # Bố cục trang web
│   │   ├── Sidebar.jsx         # Menu bên trái (Hiển thị theo quyền Admin/Điều phối...)
│   │   ├── Header.jsx          # Thanh trên cùng (Thông tin User, Đăng xuất)
│   │   └── MainLayout.jsx      # Khung bao bọc nội dung chính
│   └── specific/               # Component đặc thù cho dự án này
│       ├── StatusBadge.jsx     # Hiển thị màu trạng thái (Đã đón, Hoàn thành, Sự cố)
│       └── ChecklistForm.jsx   # Form checklist nhận/bàn giao xe (Req số 7)
│
├── constants/                  # Các hằng số cố định (Rất quan trọng để tránh Hardcode)
│   ├── roles.js                # Định nghĩa: ADMIN, DISPATCHER, DRIVER, ACCOUNTANT
│   ├── bookingStatus.js        # Trạng thái: CHO_GAN, DA_DON, HOAN_THANH...
│   └── routes.js               # Đường dẫn URL
│
├── contexts/ (hoặc store)      # Quản lý State toàn cục (Khuyên dùng React Context hoặc Zustand/Redux)
│   ├── AuthContext.jsx         # Lưu thông tin User đang login và Quyền của họ
│   └── SocketContext.jsx       # (Nếu có realtime) Để cập nhật trạng thái chuyến đi tức thì
│
├── hooks/                      # Custom Hooks (Logic tái sử dụng)
│   ├── useAuth.js              # Kiểm tra đăng nhập/phân quyền nhanh
│   ├── useFetch.js             # Gọi API và xử lý loading/error
│   └── useDebounce.js          # Dùng cho ô tìm kiếm (Search)
│
├── pages/                      # Các màn hình chính (Mapping theo yêu cầu của bạn)
│   ├── Auth/
│   │   ├── Login.jsx           # (Req 1) Màn hình đăng nhập
│   │   └── ChangePassword.jsx  # (Req 12) Đổi mật khẩu
│   │
│   ├── Dispatch/               # (Req 2, 3) VẬN HÀNH & ĐIỀU XE
│   │   ├── DispatchConsole.jsx # Màn hình chính: List chuyến chờ, List xe hoạt động, Kéo thả
│   │   ├── BookingForm.jsx     # Form tạo mới/sửa chuyến đi
│   │   └── ActiveVehicles.jsx  # (Req 3) Chi tiết xe 24/24, khách đang phục vụ
│   │
│   ├── Vehicles/               # (Req 4) QUẢN LÝ XE
│   │   ├── VehicleList.jsx     # Danh sách xe, lọc, tìm kiếm
│   │   ├── VehicleDetail.jsx   # Chi tiết, lịch sử hoạt động, doanh thu
│   │   ├── MaintenanceLog.jsx  # Lịch sử bảo dưỡng
│   │   └── HandoverHistory.jsx # (Req 7) Lịch sử bàn giao xe (kèm ảnh)
│   │
│   ├── Drivers/                # (Req 5, 6) QUẢN LÝ TÀI XẾ
│   │   ├── DriverList.jsx      # Danh sách tài xế
│   │   └── Rostering.jsx       # (Req 6) Lịch làm việc/Phân ca
│   │
│   ├── Accounting/             # (Req 8, 10, 11) KẾ TOÁN & TIỀN
│   │   ├── CashDeposit.jsx     # (Req 8) Tài xế nộp tiền / Kế toán xác nhận
│   │   ├── ExpenseManage.jsx   # (Req 10, 11) Quản lý chi phí (Admin/Điều xe nhập)
│   │   └── DriverSalary.jsx    # (Req 2 - bổ sung) Tính lương/doanh số điều hành
│   │
│   ├── Customers/              # (Req 9) QUẢN LÝ KHÁCH HÀNG
│   │   └── CustomerList.jsx    # Danh sách, lịch sử đặt, thêm mới
│   │
│   ├── Staff/                  # (Req 12) QUẢN LÝ NHÂN VIÊN (Admin)
│   │   └── StaffList.jsx       # Thêm sửa xóa nhân viên nội bộ
│   │
│   └── Reports/                # (Req 10) BÁO CÁO
│       ├── RevenueReport.jsx   # Doanh thu theo xe/nhân viên
│       └── ExpenseReport.jsx   # Báo cáo chi phí
│
├── router/                     # Cấu hình đường dẫn và bảo vệ Router
│   ├── AppRouter.jsx           # Định nghĩa các Route
│   └── PrivateRoute.jsx        # Middleware: Chặn user không đúng quyền truy cập
│
├── utils/                      # Các hàm tiện ích
│   ├── formatCurrency.js       # Format tiền tệ (VND)
│   ├── formatDate.js           # Format ngày tháng (DD/MM/YYYY)
│   └── statusMapper.js         # Chuyển mã trạng thái sang Text hiển thị
│
├── App.jsx                     # Root Component
└── main.jsx                    # Entry point