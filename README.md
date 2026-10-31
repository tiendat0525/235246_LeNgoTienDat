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

## Cơ sở dữ liệu MongoDB Atlas

- Database: 235246_LeNgoTienDat.
- Collection: devices.
- Đã thêm 3 bản ghi mẫu:
  - TB001: Máy chiếu Epson EB-X06.
  - TB002: Máy tính Dell OptiPlex 7010.
  - TB003: Loa Yamaha DBR10.

### Các trường dữ liệu

deviceId, name, deviceType, room, brand, model,
quantity, status, purchaseDate, description.

Trạng thái thiết bị dự kiến hỗ trợ: Đang sử dụng,
Hư hỏng, Đang sửa chữa, Ngừng sử dụng.

### Cấu hình kết nối

Tạo backend/.env theo mẫu backend/.env.example.
Điền MONGODB_URI bằng chuỗi kết nối MongoDB Atlas,
chỉ định database 235246_LeNgoTienDat.

File .env được Git bỏ qua, không đưa thông tin xác thực
lên repository. Kết nối thực tế sẽ được kiểm tra khi
xây dựng backend.

## Chạy backend bằng Docker

Docker image: tiendat0525/backend:1.0

Docker Hub: https://hub.docker.com/r/tiendat0525/backend

### Chuẩn bị cấu hình

Tạo backend/.env theo backend/.env.example.
Điền PORT=5000 và MONGODB_URI kết nối database
235246_LeNgoTienDat trên MongoDB Atlas.

Không đưa file .env lên GitHub hoặc nhúng vào Docker image.

### Build image

Chạy từ thư mục gốc dự án:

```powershell
docker build -t tiendat0525/backend:1.0 ./backend
```

### Chạy container

Đảm bảo cổng 5000 chưa được ứng dụng khác sử dụng:

```powershell
docker run -d --name devices-backend -p 5000:5000 --env-file ./backend/.env tiendat0525/backend:1.0
```

Nếu container devices-backend đã tồn tại nhưng đang dừng:

```powershell
docker start devices-backend
```

### Kiểm tra

- http://localhost:5000/health
- http://localhost:5000/api/devices

Xem log:

```powershell
docker logs devices-backend
```

### Đẩy image lên Docker Hub

```powershell
docker login
docker push tiendat0525/backend:1.0
```

## Chạy frontend bằng Docker

Docker image: tiendat0525/frontend:1.0

Docker Hub: https://hub.docker.com/r/tiendat0525/frontend

### Build image

Chạy từ thư mục gốc dự án:

```powershell
docker build --build-arg VITE_API_URL=http://localhost:5000 -t tiendat0525/frontend:1.0 ./frontend
```

VITE_API_URL là địa chỉ backend được đưa vào frontend lúc build.
Khi đổi địa chỉ backend, cần build lại image với giá trị mới.

### Chạy container

Đảm bảo backend đang chạy tại http://localhost:5000
và cổng 5173 chưa bị ứng dụng khác sử dụng.

```powershell
docker run -d --name devices-frontend -p 5173:80 tiendat0525/frontend:1.0
```

Nếu container đã tồn tại nhưng đang dừng:

```powershell
docker start devices-frontend
```

Truy cập giao diện tại http://localhost:5173.

### Đẩy image lên Docker Hub

```powershell
docker push tiendat0525/frontend:1.0
```

## Triển khai frontend trên Render

- Service: web-235246.
- Region: Singapore.
- Gói: Free.
- Docker image: tiendat0525/frontend:1.1.
- URL: https://web-235246.onrender.com

Frontend được build với địa chỉ backend công khai:

```powershell
docker build --build-arg VITE_API_URL=https://api-235246.onrender.com -t tiendat0525/frontend:1.1 ./frontend
docker push tiendat0525/frontend:1.1
```

Trên Render, tạo Web Service từ Existing Image,
sử dụng docker.io/tiendat0525/frontend:1.1.

Đã kiểm tra danh sách, tìm kiếm, xem chi tiết,
thêm, cập nhật và xóa thiết bị trên giao diện cloud.

## Triển khai backend API trên Render

- Service: api-235246.
- Region: Singapore.
- Gói: Free.
- Docker image: tiendat0525/backend:1.0.
- URL: https://api-235246.onrender.com
- Health Check Path: /health.

### Biến môi trường

- MONGODB_URI: cấu hình bí mật trên Render, kết nối
  database 235246_LeNgoTienDat.
- PORT: 5000.
- NODE_ENV: production.
- CLIENT_URL: https://web-235246.onrender.com.

Không lưu giá trị MONGODB_URI chứa mật khẩu trong tài liệu
hoặc mã nguồn công khai.

### Quyền truy cập MongoDB Atlas

Đã thêm các dải IP outbound của Render Singapore
vào Atlas IP Access List:

- 74.220.52.0/24.
- 74.220.60.0/24.

### API công khai

- GET /health.
- GET /api/devices.
- GET /api/devices?search=TB002.
- GET /api/devices/:id.
- POST /api/devices.
- PUT /api/devices/:id.
- DELETE /api/devices/:id.

### Kiểm thử

Đã kiểm tra frontend gọi backend trên Render;
thêm thiết bị, cập nhật tình trạng và đối chiếu dữ liệu
trong MongoDB Atlas, sau đó xóa thiết bị thử nghiệm.