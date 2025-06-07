# Hướng dẫn deploy lên Render

## Các bước chuẩn bị

1. Đảm bảo bạn đã có tài khoản Render (https://render.com)
2. Đã kết nối tài khoản Render với GitHub/GitLab nơi lưu trữ mã nguồn

## Deploy sử dụng Dashboard của Render

1. Đăng nhập vào Render
2. Chọn "New +" > "Web Service"
3. Liên kết với repository của bạn
4. Chọn "Use Dockerfile" khi được hỏi về loại deployment
5. Điền thông tin:
   - Name: backend-api (hoặc tên bạn muốn)
   - Region: Chọn region gần với người dùng của bạn
   - Branch: main (hoặc nhánh bạn muốn deploy)
   - Plan: Free (hoặc plan phù hợp với nhu cầu)
6. Cấu hình biến môi trường (Environment Variables):
   - NODE_ENV: production
   - DATABASE_HOST: [địa chỉ PostgreSQL của bạn]
   - DATABASE_PORT: 5432
   - DATABASE_USERNAME: [username PostgreSQL]
   - DATABASE_PASSWORD: [password PostgreSQL]
   - DATABASE_NAME: sport-booking
   - ELASTICSEARCH_NODE: [địa chỉ Elasticsearch của bạn]
7. Nhấp "Create Web Service"

## Deploy sử dụng render.yaml

1. Đảm bảo file render.yaml đã được đưa vào repository
2. Tạo một "Blueprint" mới trong Render
3. Liên kết với repository của bạn
4. Render sẽ tự động đọc file render.yaml và cấu hình dịch vụ
5. Điền biến môi trường còn thiếu
6. Nhấp "Apply"

## Lưu ý

- Bạn cần phải có cả PostgreSQL và Elasticsearch đã được cài đặt trước đó (có thể sử dụng Render Database hoặc dịch vụ khác)
- Cập nhật các biến môi trường liên quan đến DATABASE và ELASTICSEARCH_NODE với thông tin kết nối đúng
- Nếu sử dụng Free Plan, dịch vụ của bạn sẽ bị tắt sau 15 phút không hoạt động và khởi động lại khi có yêu cầu mới

## Kiểm tra

Sau khi deploy, bạn có thể kiểm tra API của mình tại URL được Render cung cấp: `https://backend-api.onrender.com/api`

## Theo dõi logs

Bạn có thể theo dõi logs của ứng dụng trong phần "Logs" của dịch vụ trên Render Dashboard 