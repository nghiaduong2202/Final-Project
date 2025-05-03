import { Facility } from '@/types/facility.type';
import api from './api';

// Interface cho search params
export interface SearchParams {
  query?: string;            // Từ khóa tìm kiếm
  minRating?: number;        // Đánh giá tối thiểu (0-5)
  sportIds?: number[];       // ID của môn thể thao dưới dạng mảng số nguyên
  location?: string;         // Địa điểm cụ thể
  limit?: number;            // Số lượng kết quả trên một trang
  page?: number;             // Số trang
  sortBy?: string;           // Trường để sắp xếp (ví dụ: avgRating, createdAt)
  sortOrder?: 'asc' | 'desc'; // Thứ tự sắp xếp
  province?: string;         // Mã tỉnh/thành phố
  district?: string;         // Mã quận/huyện
}

// Facility service with real API calls
class SearchService {
  // Function tìm kiếm cơ sở
  async searchFacilities(params: SearchParams = {}): Promise<Facility[]> {
    try {
      // Đối với các tham số thông thường, chúng ta sẽ sử dụng phương thức thông thường
      const { sportIds, ...otherParams } = params;

      // Tạo URLSearchParams để xây dựng query string
      const urlParams = new URLSearchParams();
      
      // Thêm các tham số thông thường
      Object.entries(otherParams).forEach(([key, value]) => {
        if (value !== undefined) {
          urlParams.append(key, value.toString());
        }
      });
      
      // Xử lý đặc biệt cho sportIds - thêm mỗi ID như một tham số riêng biệt với cùng tên
      if (sportIds && Array.isArray(sportIds) && sportIds.length > 0) {
        sportIds.forEach(id => {
          // Chuyển đổi sang số nguyên nếu chưa phải
          const intId = typeof id === 'string' ? parseInt(id) : id;
          urlParams.append('sportIds', intId.toString());
        });
      }
      
      // Tạo URL đầy đủ với query params
      const url = `/search/facilities?${urlParams.toString()}`;
      
      // Gọi API
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi tìm kiếm:', error);
      throw error;
    }
  }
}

export const searchService = new SearchService();
