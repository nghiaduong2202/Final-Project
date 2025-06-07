# Search Module

## Tổng quan

Search Module cung cấp các tính năng tìm kiếm và gợi ý cho cơ sở thể thao dựa trên Elasticsearch. Module này hỗ trợ các tính năng:

1. **Tìm kiếm cơ sở thể thao** với nhiều bộ lọc và sắp xếp
2. **Gợi ý tìm kiếm** (suggestions/autocomplete) khi người dùng gõ
3. **Hỗ trợ đầy đủ tiếng Việt** (cả chữ có dấu và không dấu)

## API Endpoints

### 1. Tìm kiếm cơ sở thể thao

```
GET /search/facilities
```

#### Tham số

| Tham số    | Kiểu          | Mô tả                                           | Ví dụ           |
|------------|---------------|------------------------------------------------|-----------------|
| query      | string        | Từ khóa tìm kiếm theo tên hoặc địa điểm        | "bóng đá", "san", "thủ đô" |
| page       | number        | Trang hiện tại (mặc định: 1)                   | 1               |
| limit      | number        | Số kết quả mỗi trang (mặc định: 10, tối đa: 100) | 10            |
| sortBy     | string        | Trường để sắp xếp                              | "avgRating"     |
| sortOrder  | asc/desc      | Thứ tự sắp xếp (mặc định: desc)                | "desc"          |
| location   | string        | Tìm theo địa điểm                              | "Hà Nội"        |
| province   | string        | Lọc theo tỉnh/thành phố                        | "Thành phố Hà Nội" |
| district   | string        | Lọc theo quận/huyện                            | "Cầu Giấy"      |
| minRating  | number (0-5)  | Đánh giá tối thiểu                             | 4               |
| sportIds   | number/array  | ID của môn thể thao (một hoặc nhiều)           | 1 hoặc [1,2,3]  |

#### Kết quả trả về

```json
[
  {
    "id": "uuid-string",
    "name": "Tên cơ sở",
    "description": "Mô tả",
    "location": "Địa chỉ đầy đủ",
    "avgRating": 4.5,
    "numberOfRating": 10,
    "status": "active",
    "imagesUrl": ["url1", "url2"],
    "sports": [
      {
        "id": 1,
        "name": "tên môn thể thao"
      }
    ],
    "minPrice": 120000,
    "maxPrice": 250000,
    ...
  }
]
```

### 2. Gợi ý tìm kiếm (Autocomplete)

```
GET /search/suggestions
```

#### Tham số

| Tham số    | Kiểu           | Mô tả                                          | Ví dụ           |
|------------|----------------|------------------------------------------------|-----------------|
| prefix     | string         | Tiền tố để gợi ý (từ khóa đang gõ)            | "san"           |
| type       | name/location/all | Loại gợi ý (mặc định: all)                  | "name"          |
| size       | number         | Số lượng gợi ý tối đa (mặc định: 5)           | 5               |
| showDetails| boolean        | Hiển thị thông tin chi tiết (mặc định: false) | true            |

#### Kết quả trả về (showDetails=false)

```json
{
  "suggestions": [
    {
      "text": "Sân Bóng Đá Mini Thủ Đô",
      "type": "name"
    },
    {
      "text": "Sân Vận Động Mỹ Đình",
      "type": "name"
    }
  ]
}
```

#### Kết quả trả về (showDetails=true)

```json
{
  "suggestions": [
    {
      "text": "Sân Bóng Đá Mini Thủ Đô",
      "type": "name",
      "id": "uuid-string",
      "imageUrl": "https://example.com/image.jpg",
      "location": "123 Trần Duy Hưng, Hà Nội"
    },
    {
      "text": "Sân Vận Động Mỹ Đình",
      "type": "name",
      "id": "uuid-string",
      "imageUrl": "https://example.com/image2.jpg",
      "location": "Mỹ Đình, Hà Nội"
    }
  ]
}
```

### 3. Chi tiết cơ sở theo ID

```
GET /search/facility/:id
```

Trả về thông tin chi tiết của cơ sở theo ID.

## Tính năng hỗ trợ tiếng Việt

Module search đã được cấu hình để hỗ trợ đầy đủ tìm kiếm tiếng Việt, bao gồm:

1. **Tìm kiếm không phân biệt dấu**: Có thể tìm kiếm "bong" hoặc "bóng" và nhận được cùng kết quả
2. **Analyzer tiếng Việt**: Sử dụng custom analyzer với các bộ lọc:
   - `lowercase`: Chuyển đổi thành chữ thường
   - `asciifolding`: Loại bỏ dấu để hỗ trợ tìm kiếm không dấu

### Cách hoạt động

1. Khi lưu dữ liệu vào Elasticsearch, cả dạng có dấu và không dấu đều được lập chỉ mục
2. Khi tìm kiếm, từ khóa được xử lý bằng cùng analyzer, cho phép tìm kiếm cross-matching
3. Cơ chế tìm kiếm được áp dụng cho cả tên cơ sở và địa điểm

## Hướng dẫn sử dụng

### Frontend

Để kết nối với API search từ frontend:

#### Tìm kiếm cơ sở

```typescript
// Ví dụ sử dụng axios
async function searchFacilities(query, filters = {}) {
  const params = {
    query,
    ...filters
  };
  
  const response = await axios.get('/api/search/facilities', { params });
  return response.data;
}

// Ví dụ sử dụng với các bộ lọc
searchFacilities('bong', {
  sportIds: 1,
  minRating: 4,
  page: 1,
  limit: 10
});
```

#### Lấy gợi ý tìm kiếm

```typescript
async function getSuggestions(prefix, options = {}) {
  const params = {
    prefix,
    ...options
  };
  
  const response = await axios.get('/api/search/suggestions', { params });
  return response.data.suggestions;
}

// Ví dụ: Lấy gợi ý hiển thị chi tiết
getSuggestions('san', {
  type: 'name',
  showDetails: true
});
```

## Các endpoint debug/admin

Các endpoint sau chỉ nên sử dụng cho mục đích debug và admin:

1. `GET /search/test-vietnamese` - Kiểm tra tính năng tìm kiếm tiếng Việt
2. `GET /search/update-vietnamese-support` - Cập nhật cấu hình tiếng Việt và reindex dữ liệu
3. `GET /search/check-mapping` - Kiểm tra cấu trúc mapping hiện tại
4. `GET /search/count` - Đếm số lượng document trong index 