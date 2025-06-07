# Bookings Module

## Tổng quan

Bookings Module cung cấp các tính năng quản lý đặt sân cho người dùng. Module này hỗ trợ các tính năng:

1. **Tạo và quản lý lịch đặt sân** cho người chơi (player)
2. **Xem lịch đặt sân** cho chủ sân (owner)
3. **Cập nhật thông tin đặt sân** như thêm dịch vụ, chỉnh sửa thời gian
4. **Hủy đặt sân**

## API Endpoints

### 1. Tạo đơn đặt sân nháp

```
POST /booking/create-draft
```

#### Yêu cầu

- **Role**: Player
- **Body**: CreateDraftBookingDto

#### Kết quả trả về

Thông tin đơn đặt sân vừa được tạo bao gồm ID.

### 2. Cập nhật thông tin đặt sân

```
PUT /booking/:bookingId/update-booking-slot
```

#### Yêu cầu

- **Role**: Player
- **Params**: bookingId - ID của đơn đặt sân
- **Body**: UpdateBookingSlotDto

#### Kết quả trả về

Thông tin đơn đặt sân sau khi cập nhật.

### 3. Cập nhật dịch vụ bổ sung

```
PUT /booking/:bookingId/update-additional-services
```

#### Yêu cầu

- **Role**: Player
- **Params**: bookingId - ID của đơn đặt sân
- **Body**: UpdateAdditionalServicesDto

#### Kết quả trả về

Thông tin đơn đặt sân sau khi cập nhật dịch vụ.

### 4. Lấy danh sách đơn đặt sân của người chơi

```
GET /booking/player
```

#### Yêu cầu

- **Role**: Player

#### Kết quả trả về

Danh sách các đơn đặt sân của người chơi hiện tại.

### 5. Lấy danh sách đơn đặt sân của chủ sân

```
GET /booking/owner
```

#### Yêu cầu

- **Role**: Owner

#### Kết quả trả về

Danh sách các đơn đặt sân cho tất cả cơ sở của chủ sân hiện tại.

### 6. Xóa đơn đặt sân nháp

```
DELETE /booking/:bookingId/delete-draft
```

#### Yêu cầu

- **Role**: Player
- **Params**: bookingId - ID của đơn đặt sân nháp

#### Kết quả trả về

Xác nhận xóa thành công.

### 7. Lấy thông tin chi tiết đơn đặt sân

```
GET /booking/:bookingId/detail
```

#### Yêu cầu

- **Role**: Không yêu cầu (NONE)
- **Params**: bookingId - ID của đơn đặt sân

#### Kết quả trả về

Thông tin chi tiết của đơn đặt sân bao gồm:
- Thông tin người đặt
- Thông tin sân
- Thông tin thời gian
- Thông tin dịch vụ bổ sung
- Trạng thái đơn

### 8. Lấy lịch đặt sân (dạng lịch)

```
GET /booking/schedule
```

#### Yêu cầu

- **Role**: Owner
- **Query**: GetScheduleDto

#### Kết quả trả về

Danh sách các đơn đặt sân theo định dạng lịch.

### 9. Hủy đơn đặt sân

```
PUT /booking/:bookingId/cancel
```

#### Yêu cầu

- **Role**: Player
- **Params**: bookingId - ID của đơn đặt sân

#### Kết quả trả về

Xác nhận hủy thành công và thông tin đơn đặt sân sau khi hủy.

## Quy trình đặt sân

Quy trình đặt sân bao gồm các bước sau:

1. **Tạo đơn đặt sân nháp** (Draft): Người chơi tạo đơn đặt sân nháp với thông tin cơ bản
2. **Cập nhật thông tin đặt sân**: Người chơi có thể cập nhật thời gian, sân
3. **Thêm dịch vụ bổ sung**: Người chơi có thể thêm các dịch vụ bổ sung (nếu có)
4. **Thanh toán**: Sau khi hoàn tất thông tin, người chơi tiến hành thanh toán
5. **Hoàn tất đặt sân**: Sau khi thanh toán thành công, đơn đặt sân được chuyển sang trạng thái đã thanh toán

## Trạng thái đơn đặt sân

Đơn đặt sân có các trạng thái sau:

- **DRAFT**: Đơn nháp, chưa thanh toán
- **PAID**: Đã thanh toán
- **COMPLETED**: Đã hoàn thành (sau khi sử dụng sân)
- **CANCELLED**: Đã hủy

## Hướng dẫn sử dụng

### Frontend

Để kết nối với API bookings từ frontend:

#### Tạo đơn đặt sân nháp

```typescript
// Ví dụ sử dụng axios
async function createDraftBooking(data) {
  const response = await axios.post('/api/booking/create-draft', data);
  return response.data;
}

// Ví dụ dữ liệu
const bookingData = {
  facilityId: 'uuid-string',
  fieldGroupId: 1,
  fieldId: 2,
  date: '2023-07-15',
  startTime: '19:00',
  endTime: '20:00',
  sportId: 1
};

createDraftBooking(bookingData);
```

#### Cập nhật thông tin đặt sân

```typescript
async function updateBookingSlot(bookingId, data) {
  const response = await axios.put(`/api/booking/${bookingId}/update-booking-slot`, data);
  return response.data;
}

// Ví dụ dữ liệu
const slotData = {
  fieldGroupId: 2,
  fieldId: 5,
  date: '2023-07-16',
  startTime: '18:00',
  endTime: '19:00'
};

updateBookingSlot('booking-uuid', slotData);
```

#### Thêm dịch vụ bổ sung

```typescript
async function updateAdditionalServices(bookingId, data) {
  const response = await axios.put(`/api/booking/${bookingId}/update-additional-services`, data);
  return response.data;
}

// Ví dụ dữ liệu
const servicesData = {
  additionalServiceIds: [1, 3, 5]
};

updateAdditionalServices('booking-uuid', servicesData);
```

#### Hủy đơn đặt sân

```typescript
async function cancelBooking(bookingId) {
  const response = await axios.put(`/api/booking/${bookingId}/cancel`);
  return response.data;
}

cancelBooking('booking-uuid');
``` 