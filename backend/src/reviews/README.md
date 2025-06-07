# Reviews Module

## Tổng quan

Reviews Module cung cấp chức năng đánh giá và phản hồi cho cơ sở thể thao, bao gồm:

1. **Đánh giá cơ sở thể thao** của người chơi
2. **Phản hồi đánh giá** từ chủ sân
3. **Quản lý điểm đánh giá** và bình luận
4. **Hiển thị đánh giá** cho người dùng

## API Endpoints

### 1. Tạo đánh giá mới

```
POST /review
```

#### Yêu cầu

- **Role**: Player
- **Body**: CreateReviewDto - Thông tin đánh giá
- **Form data**: images - Các hình ảnh đính kèm (nếu có)

#### Kết quả trả về

Thông tin đánh giá vừa được tạo bao gồm ID.

### 2. Cập nhật đánh giá

```
PUT /review/update-review
```

#### Yêu cầu

- **Role**: Player
- **Body**: UpdateReviewDto - Thông tin cập nhật

#### Kết quả trả về

Thông tin đánh giá sau khi cập nhật.

### 3. Phản hồi đánh giá (từ chủ sân)

```
PUT /review/:reviewId/feedback
```

#### Yêu cầu

- **Role**: Owner
- **Params**: reviewId - ID của đánh giá
- **Body**: message - Nội dung phản hồi

#### Kết quả trả về

Thông tin đánh giá sau khi thêm phản hồi.

### 4. Lấy đánh giá theo cơ sở

```
GET /review/facility/:facilityId
```

#### Yêu cầu

- **Role**: Không yêu cầu (NONE)
- **Params**: facilityId - ID của cơ sở

#### Kết quả trả về

Danh sách các đánh giá của cơ sở.

### 5. Lấy chi tiết đánh giá

```
GET /review/:reviewId
```

#### Yêu cầu

- **Role**: Không yêu cầu (NONE)
- **Params**: reviewId - ID của đánh giá

#### Kết quả trả về

Thông tin chi tiết của đánh giá.

## Cấu trúc dữ liệu

### Đánh giá (Review)

- **ID**: Định danh duy nhất của đánh giá
- **Player**: Người chơi tạo đánh giá
- **Facility**: Cơ sở được đánh giá
- **Rating**: Điểm đánh giá (1-5)
- **Content**: Nội dung đánh giá
- **Images**: Danh sách URL hình ảnh đính kèm
- **Feedback**: Phản hồi từ chủ sân
- **Created At**: Thời gian tạo đánh giá
- **Updated At**: Thời gian cập nhật đánh giá gần nhất

## Quy tắc đánh giá

- Người chơi chỉ có thể đánh giá cơ sở sau khi đã hoàn thành đơn đặt sân tại cơ sở đó
- Mỗi người chơi chỉ có thể đánh giá cơ sở một lần cho mỗi đơn đặt sân
- Điểm đánh giá được tính từ 1-5 sao
- Chủ sân có thể phản hồi đánh giá nhưng không thể sửa hoặc xóa đánh giá
- Người chơi có thể cập nhật đánh giá của mình

## Điểm đánh giá trung bình

Điểm đánh giá trung bình của cơ sở được tính dựa trên tất cả các đánh giá hợp lệ theo công thức:

```
Điểm trung bình = Tổng điểm đánh giá / Số lượng đánh giá
```

Điểm đánh giá trung bình được hiển thị trên trang chi tiết cơ sở và trang tìm kiếm.

## Hướng dẫn sử dụng

### Frontend

Để kết nối với API reviews từ frontend:

#### Tạo đánh giá mới

```typescript
// Ví dụ sử dụng axios + FormData
async function createReview(reviewData, imageFiles) {
  const formData = new FormData();
  
  // Thêm thông tin đánh giá
  formData.append('facilityId', reviewData.facilityId);
  formData.append('bookingId', reviewData.bookingId);
  formData.append('rating', reviewData.rating);
  formData.append('content', reviewData.content);
  
  // Thêm hình ảnh (nếu có)
  if (imageFiles && imageFiles.length > 0) {
    imageFiles.forEach(file => {
      formData.append('images', file);
    });
  }
  
  const response = await axios.post('/api/review', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  
  return response.data;
}

// Ví dụ dữ liệu
const reviewData = {
  facilityId: 'facility-uuid',
  bookingId: 'booking-uuid',
  rating: 4,
  content: 'Sân rất tốt, dịch vụ chu đáo. Tuy nhiên, phòng thay đồ hơi nhỏ.'
};

// Gọi hàm tạo đánh giá
createReview(reviewData, imageFiles);  // imageFiles là mảng các file hình ảnh
```

#### Cập nhật đánh giá

```typescript
async function updateReview(reviewData) {
  const response = await axios.put('/api/review/update-review', reviewData);
  return response.data;
}

// Ví dụ dữ liệu
const updatedReview = {
  reviewId: 123,
  rating: 5,
  content: 'Sau khi trải nghiệm nhiều lần, tôi thấy sân rất tốt, dịch vụ chu đáo và chuyên nghiệp.'
};

updateReview(updatedReview);
```

#### Phản hồi đánh giá (dành cho chủ sân)

```typescript
async function respondToReview(reviewId, feedback) {
  const response = await axios.put(`/api/review/${reviewId}/feedback`, { feedback });
  return response.data;
}

// Ví dụ dữ liệu
respondToReview(123, 'Cảm ơn bạn đã đánh giá. Chúng tôi sẽ cải thiện phòng thay đồ trong thời gian tới.');
```

#### Lấy đánh giá theo cơ sở

```typescript
async function getFacilityReviews(facilityId) {
  const response = await axios.get(`/api/review/facility/${facilityId}`);
  return response.data;
}

getFacilityReviews('facility-uuid');
```

## Hiển thị đánh giá

Khi hiển thị đánh giá trên giao diện người dùng, nên bao gồm các thông tin sau:

1. Tên người đánh giá
2. Thời gian đánh giá
3. Điểm đánh giá (hiển thị dưới dạng sao)
4. Nội dung đánh giá
5. Hình ảnh đính kèm (nếu có)
6. Phản hồi từ chủ sân (nếu có)

Đánh giá nên được sắp xếp theo thứ tự từ mới nhất đến cũ nhất. 