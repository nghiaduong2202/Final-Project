# Facilities Module

## Tổng quan

Facilities Module cung cấp các tính năng quản lý cơ sở thể thao, bao gồm:

1. **Tạo và quản lý cơ sở thể thao** cho chủ sân (owner)
2. **Hiển thị thông tin cơ sở thể thao** cho người dùng
3. **Quản lý giấy phép và chứng chỉ** của cơ sở
4. **Thêm/xóa/sửa hình ảnh** cơ sở
5. **Quản lý danh sách yêu thích** của người chơi

## API Endpoints

### 1. Tạo cơ sở thể thao mới

```
POST /facility/create
```

#### Yêu cầu

- **Role**: Owner
- **Form data**:
  - `facilityInfo`: CreateFacilityDto - Thông tin cơ bản của cơ sở
  - `sportLicenses`: SportLicensesDto - Thông tin về giấy phép thể thao
  - `images`: File[] - Tối đa 10 hình ảnh của cơ sở
  - `licenses`: File[] - Tối đa 7 giấy phép
  - `certificate`: File - Giấy chứng nhận kinh doanh

#### Kết quả trả về

Thông tin cơ sở thể thao vừa được tạo bao gồm ID.

### 2. Lấy tất cả cơ sở thể thao

```
GET /facility/all
```

#### Yêu cầu

- **Role**: Không yêu cầu (NONE)

#### Kết quả trả về

Danh sách tất cả các cơ sở thể thao trong hệ thống.

### 3. Lấy danh sách cơ sở yêu thích

```
GET /facility/favorite
```

#### Yêu cầu

- **Role**: Player

#### Kết quả trả về

Danh sách các cơ sở thể thao mà người chơi đã đánh dấu yêu thích.

### 4. Lấy thông tin dropdown cho cơ sở

```
GET /facility/drop-down
```

#### Yêu cầu

- **Role**: Owner

#### Kết quả trả về

Thông tin cơ bản của tất cả cơ sở thuộc chủ sân hiện tại, phục vụ cho dropdown menu.

### 5. Lấy cơ sở theo chủ sân

```
GET /facility/owner/:ownerId
```

#### Yêu cầu

- **Role**: Không yêu cầu (NONE)
- **Params**: ownerId - ID của chủ sân

#### Kết quả trả về

Danh sách các cơ sở thể thao thuộc chủ sân.

### 6. Lấy danh sách tên cơ sở hiện có

```
GET /facility/existing-name
```

#### Yêu cầu

- **Role**: Owner

#### Kết quả trả về

Danh sách tên các cơ sở thể thao hiện có của chủ sân.

### 7. Lấy danh sách cơ sở được đánh giá cao nhất

```
GET /facility/top-facility
```

#### Yêu cầu

- **Role**: Không yêu cầu (NONE)

#### Kết quả trả về

Danh sách các cơ sở thể thao có điểm đánh giá cao nhất.

### 8. Lấy thông tin chi tiết cơ sở

```
GET /facility/:facilityId
```

#### Yêu cầu

- **Role**: Không yêu cầu (NONE)
- **Params**: facilityId - ID của cơ sở

#### Kết quả trả về

Thông tin chi tiết của cơ sở thể thao.

### 9. Cập nhật tên cơ sở

```
PUT /facility/:facilityId/update-name
```

#### Yêu cầu

- **Role**: Owner
- **Params**: facilityId - ID của cơ sở
- **Query**: name - Tên mới của cơ sở
- **Form data**: certificate - File giấy chứng nhận kinh doanh (nếu cần thay đổi)

#### Kết quả trả về

Thông tin cơ sở sau khi cập nhật tên.

### 10. Cập nhật giấy chứng nhận

```
PUT /facility/:facilityId/update-certificate
```

#### Yêu cầu

- **Role**: Owner
- **Params**: facilityId - ID của cơ sở
- **Form data**: certificate - File giấy chứng nhận kinh doanh mới

#### Kết quả trả về

Thông tin cơ sở sau khi cập nhật giấy chứng nhận.

### 11. Cập nhật giấy phép thể thao

```
PUT /facility/:facilityId/update-license
```

#### Yêu cầu

- **Role**: Owner
- **Params**: facilityId - ID của cơ sở
- **Query**: sportId - ID của môn thể thao
- **Form data**: license - File giấy phép mới

#### Kết quả trả về

Thông tin cơ sở sau khi cập nhật giấy phép thể thao.

### 12. Thêm hình ảnh cho cơ sở

```
PUT /facility/:facilityId/add-images
```

#### Yêu cầu

- **Role**: Owner
- **Params**: facilityId - ID của cơ sở
- **Form data**: images - Các file hình ảnh mới

#### Kết quả trả về

Thông tin cơ sở sau khi thêm hình ảnh mới.

### 13. Xóa hình ảnh

```
DELETE /facility/delete-image
```

#### Yêu cầu

- **Role**: Owner
- **Body**: DeleteImageDto - Thông tin hình ảnh cần xóa

#### Kết quả trả về

Xác nhận xóa hình ảnh thành công.

### 14. Cập nhật thông tin cơ bản

```
PUT /facility/:facilityId/update-base-info
```

#### Yêu cầu

- **Role**: Owner
- **Params**: facilityId - ID của cơ sở
- **Body**: UpdateBaseInfo - Thông tin cơ bản cần cập nhật

#### Kết quả trả về

Thông tin cơ sở sau khi cập nhật thông tin cơ bản.

### 15. Lấy thời gian hoạt động

```
GET /facility/:facilityId/active-time
```

#### Yêu cầu

- **Role**: Không yêu cầu (NONE)
- **Params**: facilityId - ID của cơ sở

#### Kết quả trả về

Thông tin về thời gian hoạt động của cơ sở.

### 16. Thêm vào danh sách yêu thích

```
POST /facility/:facilityId/add-favorite
```

#### Yêu cầu

- **Role**: Player
- **Params**: facilityId - ID của cơ sở

#### Kết quả trả về

Xác nhận thêm vào danh sách yêu thích thành công.

### 17. Xóa khỏi danh sách yêu thích

```
DELETE /facility/:facilityId/delete-favorite
```

#### Yêu cầu

- **Role**: Player
- **Params**: facilityId - ID của cơ sở

#### Kết quả trả về

Xác nhận xóa khỏi danh sách yêu thích thành công.

## Cấu trúc dữ liệu

Một cơ sở thể thao bao gồm các thông tin sau:

- **Thông tin cơ bản**: Tên, mô tả, địa chỉ, trạng thái
- **Thông tin đánh giá**: Điểm đánh giá trung bình, số lượng đánh giá
- **Thông tin giấy phép**: Giấy chứng nhận kinh doanh, giấy phép thể thao
- **Thông tin hình ảnh**: Danh sách URL hình ảnh
- **Thông tin về các nhóm sân và sân**: Danh sách các nhóm sân và sân trong mỗi nhóm
- **Thông tin về thời gian hoạt động**: Giờ mở cửa, đóng cửa theo ngày

## Hướng dẫn sử dụng

### Frontend

Để kết nối với API facilities từ frontend:

#### Tạo cơ sở thể thao mới

```typescript
// Ví dụ sử dụng axios + FormData
async function createFacility(facilityInfo, sportLicenses, files) {
  const formData = new FormData();
  
  // Thêm thông tin cơ sở
  formData.append('facilityInfo', JSON.stringify(facilityInfo));
  
  // Thêm thông tin giấy phép thể thao
  formData.append('sportLicenses', JSON.stringify(sportLicenses));
  
  // Thêm hình ảnh
  if (files.images) {
    files.images.forEach(image => {
      formData.append('images', image);
    });
  }
  
  // Thêm giấy phép
  if (files.licenses) {
    files.licenses.forEach(license => {
      formData.append('licenses', license);
    });
  }
  
  // Thêm giấy chứng nhận
  if (files.certificate) {
    formData.append('certificate', files.certificate);
  }
  
  const response = await axios.post('/api/facility/create', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  
  return response.data;
}

// Ví dụ dữ liệu
const facilityInfo = {
  name: 'Sân bóng ABC',
  description: 'Sân bóng chất lượng cao',
  location: 'Số 123 Đường XYZ, Quận ABC, Thành phố DEF',
  province: 'Thành phố DEF',
  district: 'Quận ABC',
  openTime: '08:00',
  closeTime: '22:00'
};

const sportLicenses = {
  sportIds: [1, 2]  // ID của các môn thể thao
};

// Gọi hàm tạo cơ sở
createFacility(facilityInfo, sportLicenses, {
  images: imageFiles,        // Mảng file hình ảnh
  licenses: licenseFiles,    // Mảng file giấy phép
  certificate: certificateFile  // File giấy chứng nhận
});
```

#### Lấy thông tin chi tiết cơ sở

```typescript
async function getFacilityDetail(facilityId) {
  const response = await axios.get(`/api/facility/${facilityId}`);
  return response.data;
}

getFacilityDetail('facility-uuid');
```

#### Thêm/xóa khỏi danh sách yêu thích

```typescript
// Thêm vào danh sách yêu thích
async function addToFavorite(facilityId) {
  const response = await axios.post(`/api/facility/${facilityId}/add-favorite`);
  return response.data;
}

// Xóa khỏi danh sách yêu thích
async function removeFromFavorite(facilityId) {
  const response = await axios.delete(`/api/facility/${facilityId}/delete-favorite`);
  return response.data;
}

// Sử dụng
addToFavorite('facility-uuid');
removeFromFavorite('facility-uuid');
``` 