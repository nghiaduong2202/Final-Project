# Vouchers Module

## Tổng quan

Vouchers Module cung cấp chức năng quản lý mã giảm giá cho cơ sở thể thao, bao gồm:

1. **Tạo và quản lý voucher** cho chủ sân (owner)
2. **Hiển thị voucher** cho người dùng
3. **Áp dụng voucher** vào đơn đặt sân
4. **Tự động kiểm tra tính hợp lệ** của voucher

## API Endpoints

### 1. Tạo voucher mới

```
POST /voucher/:facilityId
```

#### Yêu cầu

- **Role**: Owner
- **Params**: facilityId - ID của cơ sở thể thao
- **Body**: CreateVoucherDto - Thông tin voucher

#### Kết quả trả về

Thông tin voucher vừa được tạo bao gồm ID.

### 2. Xóa voucher

```
DELETE /voucher/:voucherId
```

#### Yêu cầu

- **Role**: Owner
- **Params**: voucherId - ID của voucher

#### Kết quả trả về

Xác nhận xóa thành công.

### 3. Cập nhật voucher

```
PATCH /voucher
```

#### Yêu cầu

- **Role**: Owner
- **Body**: UpdateVoucherDto - Thông tin cập nhật

#### Kết quả trả về

Thông tin voucher sau khi cập nhật.

### 4. Lấy 6 voucher nổi bật

```
GET /voucher/six-vouchers
```

#### Yêu cầu

- **Role**: Không yêu cầu (NONE)

#### Kết quả trả về

Danh sách 6 voucher phổ biến hoặc mới nhất.

### 5. Lấy voucher theo cơ sở

```
GET /voucher/:facilityId
```

#### Yêu cầu

- **Role**: Không yêu cầu (NONE)
- **Params**: facilityId - ID của cơ sở

#### Kết quả trả về

Danh sách voucher của cơ sở.

## Cấu trúc dữ liệu

### Voucher

- **ID**: Định danh duy nhất của voucher
- **Code**: Mã voucher (duy nhất)
- **Value**: Giá trị giảm giá
- **ValueType**: Loại giảm giá (PERCENTAGE, FIXED_AMOUNT)
- **MinValue**: Giá trị đơn hàng tối thiểu để áp dụng
- **MaxValue**: Giá trị giảm tối đa (đối với voucher theo phần trăm)
- **StartDate**: Ngày bắt đầu hiệu lực
- **EndDate**: Ngày kết thúc hiệu lực
- **MaxUses**: Số lần sử dụng tối đa
- **CurrentUses**: Số lần đã được sử dụng
- **Description**: Mô tả về voucher
- **Facility**: Cơ sở áp dụng voucher
- **Status**: Trạng thái (ACTIVE, EXPIRED, USED_UP)
- **Created At**: Thời gian tạo voucher
- **Updated At**: Thời gian cập nhật voucher gần nhất

## Loại voucher

Hệ thống hỗ trợ hai loại voucher chính:

1. **Giảm theo phần trăm (PERCENTAGE)**: Giảm giá theo phần trăm giá trị đơn hàng
   - Ví dụ: Giảm 10% cho đơn hàng
   - Thường có giá trị giảm tối đa (MaxValue)

2. **Giảm theo số tiền cố định (FIXED_AMOUNT)**: Giảm trực tiếp một số tiền nhất định
   - Ví dụ: Giảm 50.000 VND cho đơn hàng

## Trạng thái voucher

Voucher có thể có các trạng thái sau:

- **ACTIVE**: Voucher đang hoạt động và có thể sử dụng
- **EXPIRED**: Voucher đã hết hạn (quá thời gian hiệu lực)
- **USED_UP**: Voucher đã hết lượt sử dụng (đạt MaxUses)
- **INACTIVE**: Voucher đã bị vô hiệu hóa bởi chủ sân

## Quy tắc áp dụng voucher

- Mỗi đơn đặt sân chỉ có thể áp dụng một voucher
- Voucher phải đang trong thời gian hiệu lực
- Giá trị đơn hàng phải đạt giá trị tối thiểu (MinValue) của voucher
- Voucher không được vượt quá số lần sử dụng tối đa
- Người dùng chỉ có thể sử dụng voucher thuộc cơ sở đang đặt sân

## Hướng dẫn sử dụng

### Frontend

Để kết nối với API vouchers từ frontend:

#### Tạo voucher mới (chủ sân)

```typescript
// Ví dụ sử dụng axios
async function createVoucher(facilityId, voucherData) {
  const response = await axios.post(`/api/voucher/${facilityId}`, voucherData);
  return response.data;
}

// Ví dụ dữ liệu
const voucherData = {
  code: 'SUMMER2023',
  value: 10,
  valueType: 'PERCENTAGE',
  minValue: 100000,
  maxValue: 50000,
  startDate: '2023-06-01',
  endDate: '2023-08-31',
  maxUses: 100,
  description: 'Giảm 10% cho các đơn đặt sân mùa hè, giảm tối đa 50k'
};

createVoucher('facility-uuid', voucherData);
```

#### Cập nhật voucher

```typescript
async function updateVoucher(voucherData) {
  const response = await axios.patch('/api/voucher', voucherData);
  return response.data;
}

// Ví dụ dữ liệu
const updateData = {
  id: 123,
  value: 15,
  maxValue: 60000,
  endDate: '2023-09-30',
  description: 'Giảm 15% cho các đơn đặt sân mùa hè, giảm tối đa 60k'
};

updateVoucher(updateData);
```

#### Lấy danh sách voucher theo cơ sở

```typescript
async function getFacilityVouchers(facilityId) {
  const response = await axios.get(`/api/voucher/${facilityId}`);
  return response.data;
}

getFacilityVouchers('facility-uuid');
```

## Hiển thị voucher

Khi hiển thị voucher trên giao diện người dùng, nên bao gồm các thông tin sau:

1. Mã voucher (Code)
2. Giá trị giảm giá (Value + ValueType)
3. Giá trị đơn hàng tối thiểu (MinValue)
4. Thời gian hiệu lực (StartDate - EndDate)
5. Mô tả voucher (Description)

## Hiệu lực và kiểm tra voucher

Hệ thống tự động kiểm tra và cập nhật trạng thái voucher:

- Kiểm tra và cập nhật voucher hết hạn hàng ngày
- Kiểm tra và cập nhật voucher hết lượt sử dụng sau mỗi lần sử dụng
- Kiểm tra tính hợp lệ của voucher khi người dùng áp dụng 