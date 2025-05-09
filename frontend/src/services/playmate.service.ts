import { 
  PlaymateSearch, 
  PlaymateApplication, 
  PlaymateFormData, 
  ApiPlaymateSearch,
  PlaymateApplicationFormData,
  PlaymateActionRequest,
  mapApiToPlaymateSearch,
  BookingSlot,
  UpdatePlaymateFormData
} from "@/types/playmate.type";
import api from "./api";

// ----- PLAYMATE SEARCH SERVICES -----
const playmateService = {
  /**
   * Lấy danh sách tất cả các bài đăng tìm bạn chơi
   */
  async getAllPlaymateSearches(): Promise<PlaymateSearch[]> {
    try {
      const response = await api.get('/playmate');
      // Map API response to UI model
      return (response.data as ApiPlaymateSearch[]).map(item => mapApiToPlaymateSearch(item));
    } catch (error) {
      console.error('Error fetching playmate searches:', error);
      throw error;
    }
  },

  /**
   * Lấy chi tiết của một bài đăng tìm bạn chơi theo ID
   */
  async getPlaymateSearchById(id: string): Promise<PlaymateSearch | undefined> {
    try {
      const response = await api.get(`/playmate/${id}`);
      // Map API response to UI model
      return mapApiToPlaymateSearch(response.data);
    } catch (error) {
      console.error(`Error fetching playmate search with id ${id}:`, error);
      throw error;
    }
  },

  /**
   * Lấy danh sách các bài đăng của người dùng hiện tại
   */
  async getUserPlaymateSearches(): Promise<PlaymateSearch[]> {
    try {
      const response = await api.get('/playmate/my-post');
      // Map API response to UI model
      return (response.data as ApiPlaymateSearch[]).map(item => mapApiToPlaymateSearch(item));
    } catch (error) {
      console.error('Error fetching user playmate searches:', error);
      throw error;
    }
  },

  /**
   * Lấy danh sách booking slot cho playmate
   */
  async getBookingSlots(): Promise<BookingSlot[]> {
    try {
      const response = await api.get('/booking-slot/playmate');
      return response.data;
    } catch (error) {
      console.error('Error fetching booking slots:', error);
      throw error;
    }
  },

  /**
   * Tạo bài đăng tìm bạn chơi mới
   */
  async createPlaymateSearch(formData: PlaymateFormData): Promise<PlaymateSearch> {
    try {
      const response = await api.post('/playmate/create', formData);
      return mapApiToPlaymateSearch(response.data);
    } catch (error) {
      console.error('Error creating playmate search:', error);
      throw error;
    }
  },

  /**
   * Cập nhật bài đăng tìm bạn chơi
   */
  async updatePlaymateSearch(formData: UpdatePlaymateFormData): Promise<PlaymateSearch> {
    try {
      const response = await api.put(`/playmate/update`, formData);
      return mapApiToPlaymateSearch(response.data);
    } catch (error) {
      console.error('Error updating playmate search:', error);
      throw error;
    }
  },
  

  /**
   * Upload ảnh lên cloud
   */
  async uploadImage(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await api.post('/cloud-uploader', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data.url;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  },

  /**
   * Lấy danh sách đơn đăng ký của người dùng hiện tại
   */
  async getUserApplications(): Promise<PlaymateSearch[]> {
    try {
      const response = await api.get('/playmate/my-register');
      // Map API response to UI model
      return (response.data as ApiPlaymateSearch[]).map(item => mapApiToPlaymateSearch(item));
    } catch (error) {
      console.error('Error fetching user applications:', error);
      throw error;
    }
  },

  /**
   * Tạo đơn đăng ký mới
   */
  async createApplication(applicationData: PlaymateApplicationFormData): Promise<PlaymateApplication> {
    try {
      const response = await api.post('/playmate/register', applicationData);
      return response.data;
    } catch (error) {
      console.error('Error creating playmate application:', error);
      throw error;
    }
  },

  /**
   * Chấp nhận đơn đăng ký
   */
  async acceptApplication(actionRequest: PlaymateActionRequest): Promise<boolean> {
    try {
      await api.put('/playmate/accept', actionRequest);
      return true;
    } catch (error) {
      console.error('Error accepting application:', error);
      throw error;
    }
  },

  /**
   * Từ chối đơn đăng ký
   */
  async rejectApplication(actionRequest: PlaymateActionRequest): Promise<boolean> {
    try {
      await api.put('/playmate/reject', actionRequest);
      return true;
    } catch (error) {
      console.error('Error rejecting application:', error);
      throw error;
    }
  },

  // /**
  //  * Hủy đơn đăng ký (người đăng ký tự hủy)
  //  */
  // async cancelApplication(applicationId: string): Promise<boolean> {
  //   try {
  //     // Note: This endpoint might need to be updated based on the actual API
  //     await api.put(`/playmate/cancel-application/${applicationId}`);
  //     return true;
  //   } catch (error) {
  //     console.error(`Error cancelling application with id ${applicationId}:`, error);
  //     throw error;
  //   }
  // }
};

export default playmateService;
