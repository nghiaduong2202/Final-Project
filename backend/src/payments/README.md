# Payments Module

## Tổng quan

Payments Module cung cấp các tính năng thanh toán cho hệ thống đặt sân. Module này hỗ trợ:

1. **Xử lý thanh toán** cho đơn đặt sân
2. **Tích hợp cổng thanh toán** 
3. **Xác thực giao dịch** thông qua IPN (Instant Payment Notification)
4. **Quản lý lịch sử giao dịch**

## API Endpoints

### 1. Thanh toán đơn đặt sân

```
PUT /payment/:paymentId
```

#### Yêu cầu

- **Role**: Player
- **Params**: paymentId - ID của giao dịch thanh toán
- **Body**: PaymentDto - Thông tin thanh toán

#### Kết quả trả về

Thông tin về phương thức thanh toán và URL để tiếp tục quá trình thanh toán (nếu cần).

### 2. Xác thực thanh toán (IPN)

```
GET /payment/ipn
```

#### Yêu cầu

- **Role**: Không yêu cầu (NONE)
- **Query**: Các tham số từ nhà cung cấp thanh toán

#### Kết quả trả về

Xác nhận đã nhận thông tin thanh toán.

## Quy trình thanh toán

Quy trình thanh toán trong hệ thống hoạt động như sau:

1. **Tạo đơn đặt sân**: Người chơi tạo đơn đặt sân và chọn dịch vụ
2. **Khởi tạo thanh toán**: Hệ thống tạo một giao dịch thanh toán liên kết với đơn đặt sân
3. **Xử lý thanh toán**: Người chơi chọn phương thức thanh toán và tiến hành thanh toán
4. **Xác thực giao dịch**: Nhà cung cấp thanh toán gửi thông báo IPN để xác nhận giao dịch
5. **Cập nhật trạng thái**: Hệ thống cập nhật trạng thái đơn đặt sân thành "Đã thanh toán"

## Các phương thức thanh toán hỗ trợ

Hệ thống hỗ trợ các phương thức thanh toán sau:

1. **VNPAY**: Thanh toán qua cổng VNPAY
2. **MOMO**: Thanh toán qua ví điện tử MOMO
3. **ZALOPAY**: Thanh toán qua ví điện tử ZaloPay

## Trạng thái thanh toán

Một giao dịch thanh toán có thể có các trạng thái sau:

- **PENDING**: Đang chờ thanh toán
- **COMPLETED**: Đã hoàn thành thanh toán
- **FAILED**: Thanh toán thất bại
- **CANCELLED**: Đã hủy thanh toán
- **REFUNDED**: Đã hoàn tiền

## Cấu trúc dữ liệu

Một giao dịch thanh toán bao gồm các thông tin:

- **ID**: Định danh duy nhất của giao dịch
- **Booking ID**: ID của đơn đặt sân liên quan
- **Amount**: Số tiền thanh toán
- **Status**: Trạng thái thanh toán
- **Provider**: Nhà cung cấp thanh toán
- **Transaction ID**: Mã giao dịch từ nhà cung cấp thanh toán
- **Created At**: Thời gian tạo giao dịch
- **Updated At**: Thời gian cập nhật giao dịch gần nhất

## Hướng dẫn sử dụng

### Frontend

Để kết nối với API payments từ frontend:

#### Thanh toán đơn đặt sân

```typescript
// Ví dụ sử dụng axios
async function makePayment(paymentId, paymentData) {
  const response = await axios.put(`/api/payment/${paymentId}`, paymentData);
  
  // Nếu cần chuyển hướng đến trang thanh toán
  if (response.data.redirectUrl) {
    window.location.href = response.data.redirectUrl;
  }
  
  return response.data;
}

// Ví dụ dữ liệu
const paymentData = {
  provider: 'VNPAY',  // VNPAY, MOMO, ZALOPAY
  returnUrl: 'https://example.com/payment/callback'
};

makePayment('payment-uuid', paymentData);
```

#### Xử lý callback từ cổng thanh toán

```typescript
// Hàm xử lý sau khi người dùng được chuyển hướng từ cổng thanh toán về
function handlePaymentCallback(queryParams) {
  // Kiểm tra trạng thái thanh toán
  const vnp_ResponseCode = queryParams.get('vnp_ResponseCode');
  
  if (vnp_ResponseCode === '00') {
    // Thanh toán thành công
    showSuccessMessage();
    // Chuyển hướng đến trang chi tiết đơn đặt sân
    navigateToBookingDetail(queryParams.get('bookingId'));
  } else {
    // Thanh toán thất bại
    showErrorMessage();
  }
}

// Sử dụng trong component React
useEffect(() => {
  const queryParams = new URLSearchParams(window.location.search);
  handlePaymentCallback(queryParams);
}, []);
```

## Xử lý lỗi thanh toán

Khi gặp lỗi trong quá trình thanh toán, hệ thống sẽ trả về các mã lỗi tương ứng:

- **PAYMENT_NOT_FOUND**: Không tìm thấy giao dịch thanh toán
- **PAYMENT_ALREADY_COMPLETED**: Giao dịch đã được thanh toán trước đó
- **PAYMENT_PROVIDER_ERROR**: Lỗi từ nhà cung cấp thanh toán
- **PAYMENT_INVALID_AMOUNT**: Số tiền thanh toán không hợp lệ

## Tích hợp nhà cung cấp thanh toán mới

Để tích hợp thêm nhà cung cấp thanh toán mới, cần thực hiện các bước sau:

1. Tạo provider mới trong thư mục `/providers`
2. Triển khai interface `IPaymentProvider`
3. Cập nhật `PaymentProviderFactory` để hỗ trợ provider mới
4. Cập nhật enum `PaymentProviderEnum` trong thư mục `enums` 