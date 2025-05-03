# ĐỒ ÁN TỐT NGHIỆP 
# ⚽ TAN - HỆ THỐNG ĐẶT SÂN THỂ THAO

## 📝 Mô tả dự án

TAN là nền tảng thương mại điện tử chuyên biệt cho việc đặt sân thể thao, kết nối người chơi thể thao với chủ sân một cách nhanh chóng và tiện lợi. Hệ thống giúp người dùng dễ dàng tìm kiếm, đặt và thanh toán sân thể thao, đồng thời cung cấp cho chủ sân công cụ quản lý hiệu quả.

### 🌟 Điểm nổi bật

- **Đặt sân linh hoạt**: Hỗ trợ đặt sân theo ngày, giờ với nhiều lựa chọn dịch vụ bổ sung
- **Tìm kiếm đa tiêu chí**: Tìm sân theo vị trí, loại sân, giá cả hoặc tiện ích
- **Tìm người chơi cùng**: Tính năng Playmate giúp kết nối người chơi có cùng sở thích
- **Quản lý sự kiện**: Tổ chức và tham gia các sự kiện thể thao, giải đấu
- **Thanh toán trực tuyến**: Tích hợp cổng thanh toán VNPay an toàn, tiện lợi
- **Dashboard chủ sân**: Công cụ quản lý toàn diện với thống kê trực quan
- **Hệ thống đánh giá**: Đánh giá và xếp hạng sân thể thao sau khi sử dụng
- **Voucher & khuyến mãi**: Quản lý và áp dụng các chương trình ưu đãi

## 🛠️ Công nghệ sử dụng

### Frontend
- **Framework**: React 18 với TypeScript
- **Build tool**: Vite
- **State Management**: Redux Toolkit, React Context API
- **Routing**: React Router v6
- **Form Handling**: React Hook Form, Yup
- **UI Components**: Material UI, Tailwind CSS
- **API Client**: Axios, React Query
- **Testing**: Jest, React Testing Library
- **Maps Integration**: Google Maps API

### Backend
- **Framework**: NestJS
- **Database**: PostgreSQL
- **ORM/ODM**: TypeORM, Prisma
- **Authentication**: JWT
- **Real-time**: Socket.io, WebSockets
- **Task Scheduling**: NestJS Schedule, Bull
- **API Documentation**: Swagger, OpenAPI
- **Testing**: Jest, Supertest

### DevOps
- **Containerization**: Docker
- **CI/CD**: GitHub Actions

## 🚀 Cài đặt và chạy dự án

### Yêu cầu hệ thống
- Node.js (>= 16.0.0)
- npm (>= 8.0.0) hoặc yarn (>= 1.22.0)
- PostgreSQL (>= 13.0)

### Cài đặt frontend

```bash
# Clone repository
git clone https://github.com/nghiaduong2202/Final-Project.git

# Di chuyển vào thư mục frontend
cd frontend

# Cài đặt dependencies
npm install

# Tạo file .env từ file mẫu
cp .env.example .env

# Chạy ứng dụng trong môi trường development
npm run dev

# Build cho production
npm run build
```

### Cài đặt backend

```bash

# Clone repository
git clone https://github.com/nghiaduong2202/Final-Project.git

# Cài đặt dependencies
npm install

# Tạo file .env từ file mẫu
cp .env.example .env

# Khởi tạo cơ sở dữ liệu
npm run migration:run

# Seed dữ liệu mẫu (tùy chọn)
npm run seed

# Chạy ứng dụng
npm run start:dev
```

### Cấu hình môi trường
Chỉnh sửa file `.env` trong thư mục frontend và backend để cấu hình:
- API endpoints
- Khóa API cho các dịch vụ bên thứ ba (Google Maps, VNPay, v.v)
- Kết nối cơ sở dữ liệu
- Cấu hình JWT và bảo mật

## 📂 Cấu trúc thư mục

```
Final-Project/
├── frontend/                  # Source code frontend
│   ├── public/                # Static files
│   │   ├── src/
│   │   │   ├── assets/            # Images, fonts, etc.
│   │   │   ├── components/        # Reusable UI components
│   │   │   ├── constants/         # Constants and enums
│   │   │   ├── contexts/          # React contexts
│   │   │   ├── hooks/             # Custom React hooks
│   │   │   ├── lib/               # Utility libraries
│   │   │   ├── mocks/             # Mock data for development
│   │   │   ├── pages/             # Application pages
│   │   │   │   ├── Public/        # Pages for public users
│   │   │   │   ├── Player/        # Pages for player users
│   │   │   │   ├── Owner/         # Pages for owner users
│   │   │   │   └── user/          # Shared user pages
│   │   │   ├── providers/         # Provider components
│   │   │   ├── routers/           # Routing configuration
│   │   │   ├── services/          # API service integration
│   │   │   ├── store/             # Redux store
│   │   │   ├── styles/            # Global styles
│   │   │   ├── types/             # TypeScript type definitions
│   │   │   ├── utils/             # Utility functions
│   │   │   ├── App.tsx            # Main App component
│   │   │   ├── index.css          # Entry CSS file
│   │   │   ├── main.tsx           # Application entry point
│   │   │   └── vite-env.d.ts      # Vite environment types
│   │   ├── .eslintrc.js           # ESLint configuration
│   │   ├── package.json           # Dependencies and scripts
│   │   ├── tailwind.config.js     # Tailwind CSS configuration
│   │   ├── tsconfig.json          # TypeScript configuration
│   │   └── vite.config.ts         # Vite configuration
│   ├── .env                   # Environment variables
│   ├── package.json           # Dependencies and scripts
│   └── tsconfig.json          # TypeScript configuration
│
├── backend/                   # Source code backend (NestJS)
│   ├── src/
│   │   ├── config/            # Configuration files
│   │   ├── modules/           # Feature modules
│   │   ├── common/            # Shared utilities, guards, decorators
│   │   ├── entities/          # Database entities
│   │   ├── dto/               # Data Transfer Objects
│   │   ├── guards/            # Authentication guards
│   │   ├── interceptors/      # Request/Response interceptors
│   │   ├── filters/           # Exception filters
│   │   ├── pipes/             # Transformation pipes
│   │   ├── main.ts            # Application entry point
│   │   └── app.module.ts      # Root module
│   ├── .env                   # Environment variables
│   ├── package.json           # Dependencies and scripts
│   └── tsconfig.json          # TypeScript configuration
│
├── Admin/                     # Admin dashboard
├── .gitignore                 # Git ignore rules
└── README.md                  # Project documentation
```

## 📞 Liên hệ

- **Nhóm phát triển**: Team TAN (Nguyễn Tuấn Anh, Dương Văn Nghĩa)
- **Email**: anh.nguyenanh564@hcmut.edu.vn, nghia.duong2022@hcmut.edu.vn

---

© 2025 TAN. Đồ án tốt nghiệp ngành Khoa học máy tính.


