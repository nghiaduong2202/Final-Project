import api from './api';
import { ReviewFormData, ReviewFormDataUpdate } from '../types/review.type';

// API Endpoints
export const reviewService = {
  // Review APIs
  async getListReviewByFacilityId(facilityId: string) {
    try{
      const response = await api.get(`/review/facility/${facilityId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching review list:', error);
      throw error;
    }
  },

  async getReviewById(reviewId: string) {
    try{
      const response = await api.get(`/review/${reviewId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching review:', error); 
      throw error;
    }
  },

  async createReview(review: ReviewFormData | FormData) {
    try {
      // Handle FormData directly
      let formDataToSend: FormData;
      
      if (!(review instanceof FormData)) {
        // Convert ReviewFormData to FormData
        formDataToSend = new FormData();
        
        // Add review data as JSON string with key 'data'
        formDataToSend.append('data', JSON.stringify(review.data));
        
        // Add image files if any with key 'images' for each file
        if (review.images && review.images.length > 0) {
          review.images.forEach((file: File) => {
            formDataToSend.append('images', file);
          });
        }
      } else {
        formDataToSend = review;
      }
      
      // Tạo timeout để ngắt kết nối nếu quá lâu
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 phút timeout
      
      try {
        const response = await api.post('/review', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        return response.data;
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  },

  async updateReview(review: ReviewFormDataUpdate ) {
    try{
      const response = await api.put(`/review/update-review`, review);
      return response.data;
    } catch (error) {
      console.error('Error updating review:', error);
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
  
  async updateFeedback(reviewId: string, feedback: string) {
    try{
      const response = await api.put(`/review/${reviewId}/feedback`, { feedback });
      return response.data;
    } catch (error) {
      console.error('Error updating review feedback:', error);
      throw error;
    }
  }
};

export default api;