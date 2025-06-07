# Playmates Module

## Tổng quan

Playmates Module cung cấp tính năng tìm bạn chơi thể thao, cho phép người dùng:

1. **Tạo bài đăng tìm đồng đội** cho các hoạt động thể thao
2. **Đăng ký tham gia** vào các bài đăng tìm đồng đội
3. **Quản lý bài đăng** và người tham gia
4. **Chấp nhận hoặc từ chối** người đăng ký

## API Endpoints

### 1. Tạo bài đăng tìm đồng đội

```
POST /playmate/create
```

#### Yêu cầu

- **Role**: Player
- **Body**: CreatePlaymateDto - Thông tin bài đăng

#### Kết quả trả về

Thông tin bài đăng vừa được tạo bao gồm ID.

### 2. Cập nhật bài đăng

```
PUT /playmate/update
```

#### Yêu cầu

- **Role**: Player
- **Body**: UpdatePlaymateDto - Thông tin cập nhật

#### Kết quả trả về

Thông tin bài đăng sau khi cập nhật.

### 3. Đăng ký tham gia

```
POST /playmate/register
```

#### Yêu cầu

- **Role**: Player
- **Body**: RegisterPlaymateDto - Thông tin đăng ký

#### Kết quả trả về

Xác nhận đăng ký thành công.

### 4. Lấy danh sách bài đăng

```
GET /playmate
```

#### Yêu cầu

- **Role**: Không yêu cầu (NONE)

#### Kết quả trả về

Danh sách tất cả các bài đăng tìm đồng đội trong hệ thống.

### 5. Lấy danh sách bài đăng của tôi

```
GET /playmate/my-post
```

#### Yêu cầu

- **Role**: Player

#### Kết quả trả về

Danh sách các bài đăng tìm đồng đội do người dùng hiện tại tạo.

### 6. Lấy danh sách bài đăng tôi đã đăng ký

```
GET /playmate/my-register
```

#### Yêu cầu

- **Role**: Player

#### Kết quả trả về

Danh sách các bài đăng tìm đồng đội mà người dùng hiện tại đã đăng ký tham gia.

### 7. Lấy chi tiết bài đăng

```
GET /playmate/:playmateId
```

#### Yêu cầu

- **Role**: Không yêu cầu (NONE)
- **Params**: playmateId - ID của bài đăng

#### Kết quả trả về

Thông tin chi tiết của bài đăng bao gồm danh sách người tham gia.

### 8. Chấp nhận người đăng ký

```
PUT /playmate/accept
```

#### Yêu cầu

- **Role**: Player
- **Body**: ParticipantDto - Thông tin người đăng ký

#### Kết quả trả về

Xác nhận chấp nhận người đăng ký thành công.

### 9. Từ chối người đăng ký

```
PUT /playmate/reject
```

#### Yêu cầu

- **Role**: Player
- **Body**: ParticipantDto - Thông tin người đăng ký

#### Kết quả trả về

Xác nhận từ chối người đăng ký thành công.

## Cấu trúc dữ liệu

### Bài đăng tìm đồng đội (Playmate Post)

- **ID**: Định danh duy nhất của bài đăng
- **Title**: Tiêu đề bài đăng
- **Description**: Mô tả chi tiết
- **Sport**: Môn thể thao
- **Facility**: Cơ sở thể thao (nếu có)
- **Location**: Địa điểm (nếu không có cơ sở cụ thể)
- **Date and Time**: Thời gian chơi
- **Max Participants**: Số lượng người tham gia tối đa
- **Current Participants**: Số lượng người tham gia hiện tại
- **Author**: Người tạo bài đăng
- **Status**: Trạng thái bài đăng (OPEN, CLOSED, FULL)
- **Created At**: Thời gian tạo bài đăng

### Người tham gia (Participant)

- **ID**: Định danh duy nhất
- **Player ID**: ID của người chơi
- **Playmate Post ID**: ID của bài đăng
- **Status**: Trạng thái (PENDING, ACCEPTED, REJECTED)
- **Message**: Tin nhắn từ người đăng ký
- **Registered At**: Thời gian đăng ký

## Trạng thái bài đăng

Bài đăng tìm đồng đội có thể có các trạng thái sau:

- **OPEN**: Đang mở, có thể đăng ký
- **CLOSED**: Đã đóng, không thể đăng ký thêm
- **FULL**: Đã đủ số lượng người tham gia
- **EXPIRED**: Đã hết hạn (quá thời gian diễn ra)

## Trạng thái đăng ký

Người đăng ký tham gia có thể có các trạng thái sau:

- **PENDING**: Đang chờ xác nhận
- **ACCEPTED**: Đã được chấp nhận
- **REJECTED**: Đã bị từ chối

## Hướng dẫn sử dụng

### Frontend

Để kết nối với API playmates từ frontend:

#### Tạo bài đăng tìm đồng đội

```typescript
// Ví dụ sử dụng axios
async function createPlaymatePost(postData) {
  const response = await axios.post('/api/playmate/create', postData);
  return response.data;
}

// Ví dụ dữ liệu
const playmateData = {
  title: 'Tìm người chơi bóng đá vào cuối tuần',
  description: 'Mình đang tìm 4 người chơi bóng vào chiều thứ 7 tuần này',
  bookingSlotId: 123,  // ID của booking slot đã đặt
  maxParticipants: 5,
  level: 'INTERMEDIATE'  // Trình độ: BEGINNER, INTERMEDIATE, ADVANCED, PROFESSIONAL
};

createPlaymatePost(playmateData);
```

#### Đăng ký tham gia bài đăng

```typescript
async function registerPlaymate(registerData) {
  const response = await axios.post('/api/playmate/register', registerData);
  return response.data;
}

// Ví dụ dữ liệu
const registerData = {
  playmateId: 'playmate-uuid',
  message: 'Mình muốn tham gia, mình đã có kinh nghiệm chơi 2 năm'
};

registerPlaymate(registerData);
```

#### Xem danh sách bài đăng tìm đồng đội

```typescript
async function getPlaymatePosts() {
  const response = await axios.get('/api/playmate');
  return response.data;
}

getPlaymatePosts();
```

#### Quản lý người đăng ký

```typescript
// Chấp nhận người đăng ký
async function acceptParticipant(participantData) {
  const response = await axios.put('/api/playmate/accept', participantData);
  return response.data;
}

// Từ chối người đăng ký
async function rejectParticipant(participantData) {
  const response = await axios.put('/api/playmate/reject', participantData);
  return response.data;
}

// Ví dụ dữ liệu
const participantData = {
  playmateId: 'playmate-uuid',
  participantId: 'player-uuid'
};

acceptParticipant(participantData);
// hoặc
rejectParticipant(participantData);
```

## Lưu ý

- Người tạo bài đăng không thể đăng ký tham gia bài đăng của chính mình
- Chỉ người tạo bài đăng mới có quyền chấp nhận hoặc từ chối người đăng ký
- Khi số lượng người tham gia đạt tối đa, trạng thái bài đăng sẽ tự động chuyển thành FULL
- Bài đăng sẽ tự động chuyển sang EXPIRED khi quá thời gian diễn ra 