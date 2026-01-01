Kiểm tra tính năng xóa xe

1. Chạy backend và frontend (server & taxi-fontEnd dev).
2. Mở trang Quản lý Xe.
3. Thêm một xe mới bằng nút "Thêm Xe".
4. Mở menu (⋮) trên thẻ xe vừa thêm, chọn "Xóa xe".
5. Xác nhận trong modal. Kết quả mong đợi:
   - Nếu backend hoạt động: xe sẽ bị ẩn (soft delete) ở server và danh sách cập nhật.
   - Nếu backend không phản hồi: sẽ hiển thị cảnh báo lỗi và hành vi fallback (client-side removal) sẽ được thực hiện nếu cần.

Ghi chú kỹ thuật:
- Frontend gọi `DELETE /api/vehicles/:id` thông qua `src/api/vehicleApi.js`.
- Backend thực hiện soft delete bằng cách đặt `isActive=false` và `status=INACTIVE`.
- Nếu bạn muốn buộc xóa vĩnh viễn, cần thay đổi controller backend và DB (không khuyến nghị).
