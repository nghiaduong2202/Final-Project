import api from './api';
import { ReviewFormData } from '../types/review.type';

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
      // Handle both FormData and regular JSON formats
      let formDataToSend: FormData;
      
      if (!(review instanceof FormData)) {
        // Convert ReviewFormData to FormData
        formDataToSend = new FormData();
        
        // Add review data as JSON string
        formDataToSend.append('data', JSON.stringify(review.data));
        
        // Add image files if any
        if (review.imageUrl && review.imageUrl.length > 0) {
          review.imageUrl.forEach((file) => {
            formDataToSend.append('imageUrl', file);
          });
        }
      } else {
        formDataToSend = review;
      }
      
      const response = await api.post('/review', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('Error creating review:', error);
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