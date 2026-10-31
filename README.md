# Hệ thống quản lý thiết bị phòng học

## Thông tin sinh viên

- Họ tên: Lê Ngô Tiến Đạt
- MSSV: 235246
- Học phần: Điện toán đám mây

## Mô tả đề tài

Ứng dụng quản lý thiết bị phòng học trên nền tảng đám mây.
Các chức năng gồm xem danh sách, xem chi tiết, tìm kiếm,
thêm, cập nhật và xóa thiết bị, theo dõi tình trạng thiết bị.

## Công nghệ sử dụng

- React và Vite: xây dựng frontend.
- Node.js và Express: xây dựng backend API.
- Mongoose và MongoDB Atlas: lưu trữ dữ liệu.
- Git và GitHub: quản lý mã nguồn.
- Docker: đóng gói frontend và backend.
- Docker Hub: lưu trữ Docker image.
- Render: triển khai ứng dụng.

## Cấu trúc dự án

- frontend/: mã nguồn giao diện React.
- backend/: mã nguồn API và kết nối cơ sở dữ liệu.
- .gitignore: quy định các file không đưa vào Git.
- README.md: mô tả dự án và hướng dẫn sử dụng.

## Hướng dẫn cài đặt và chạy

Yêu cầu máy có Node.js, npm và Git.
Cần tài khoản MongoDB Atlas để cấu hình cơ sở dữ liệu.

Dự án hiện mới khởi tạo cấu trúc. Quy trình dưới đây sẽ
được hoàn thiện và kiểm tra khi xây dựng backend, frontend.

### Backend

1. Mở Terminal trong thư mục backend.
2. Chạy npm install để cài thư viện.
3. Tạo file .env theo mẫu .env.example.
4. Cấu hình PORT và MONGODB_URI.
5. Chạy npm start.

### Frontend

1. Mở Terminal trong thư mục frontend.
2. Chạy npm install để cài thư viện.
3. Cấu hình địa chỉ backend API.
4. Chạy npm run dev.
5. Mở địa chỉ được hiển thị trong Terminal.

## Bảo mật cấu hình

Không đưa file .env, mật khẩu, access token hoặc chuỗi
kết nối có thông tin xác thực lên GitHub.
File .env.example chỉ chứa cấu hình mẫu, không chứa bí mật.

## Triển khai

Hướng dẫn Docker và URL Render sẽ được bổ sung ở các câu sau.