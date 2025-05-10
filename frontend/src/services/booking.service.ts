import api from './api';
import { Booking } from '@/types/booking.type';
import { AvailableFieldGroup } from '@/types/field.type';

/**
 * Service for handling booking-related API calls
 */
export const bookingService = {
  /**
   * Create a draft booking
   * @param startTime Booking start time
   * @param endTime Booking end time
   * @param bookingSlots Array of booking slots with date and fieldId
   * @param sportId Sport ID
   */
  async createDraftBooking(
    startTime: string,
    endTime: string,
    bookingSlots: { date: string; fieldId: number }[],
    sportId: number
  ): Promise<Booking> {
    try {
      const response = await api.post('/booking/create-draft', {
        startTime,
        endTime,
        bookingSlots,
        sportId
      });
      return response.data;
    } catch (error) {
      console.error('Error creating draft booking:', error);
      throw error;
    }
  },

  /**
   * Update booking slots for an existing booking
   * @param bookingId The ID of the booking to update
   * @param bookingSlots Array of booking slots with date and fieldId
   */
  async updateBookingSlot(
    bookingId: string,
    bookingSlots: { date: string; fieldId: number }[]
  ): Promise<Booking> {
    try {
      const response = await api.put(`/booking/${bookingId}/update-booking-slot`, {
        bookingSlots
      });
      return response.data;
    } catch (error) {
      console.error('Error updating booking slots:', error);
      throw error;
    }
  },

  /**
   * Update additional services for a booking
   * @param bookingId The ID of the booking to update
   * @param additionalServices Array of services with serviceId and amount
   */
  async updateAdditionalServices(
    bookingId: string,
    additionalServices: { serviceId: number; quantity: number }[]
  ): Promise<Booking> {
    try {
      const response = await api.put(`/booking/${bookingId}/update-additional-services`, {
        additionalServices
      });
      return response.data;
    } catch (error) {
      console.error('Error updating additional services:', error);
      throw error;
    }
  },

  /**
   * Get available field groups for a facility based on booking criteria
   * @param facilityId The ID of the facility
   * @param sportId The sport ID
   * @param dates Array of dates in ISO format (YYYY-MM-DD)
   * @param startTime Start time in HH:MM format
   * @param endTime End time in HH:MM format
   */
  async getAvailableFieldGroups(
    facilityId: string,
    sportId: number,
    dates: string[],
    startTime: string,
    endTime: string
  ): Promise<AvailableFieldGroup[]> {
    try {
      const response = await api.post(`/field-group/${facilityId}/available-field-in-facility`, {
        sportId,
        dates,
        startTime,
        endTime
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching available field groups:', error);
      throw error;
    }
  },

  /**
   * Get sports available at a facility
   * @param facilityId The ID of the facility
   */
  async getSportsByFacility(facilityId: string) {
    try {
      const response = await api.get(`/sport/${facilityId}/all-sports`);
      return response.data;
    } catch (error) {
      console.error('Error fetching sports by facility:', error);
      throw error;
    }
  },

  /**
   * Get available services for a facility
   * @param facilityId The ID of the facility
   * @param bookingId The ID of the booking
   */
  async getAvailableServices(facilityId: string, bookingId: string) {
    try {
      const response = await api.post(`/service/${facilityId}/${bookingId}/available-service-in-facility`);
      return response.data;
    } catch (error) {
      console.error('Error fetching available services:', error);
      throw error;
    }
  },

  /**
   * Process payment for a booking
   * @param paymentId The ID of the payment to process
   * @param paymentOption Payment method (e.g., 'vnpay')
   * @param voucherId Optional voucher ID
   * @param refundedPoint Optional flag to use refunded points
   */
  async processPayment(paymentId: string, paymentOption: string, voucherId?: number, refundedPoint?: number) {
    try {
      const payload: { paymentOption: string; voucherId?: number; refundedPoint?: number } = {
        paymentOption
      };
      
      if (voucherId) {
        payload.voucherId = voucherId;
      }
      
      if (refundedPoint) {
        payload.refundedPoint = refundedPoint;
      }
      
      const response = await api.put(`/payment/${paymentId}`, payload);
      return response.data;
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  },

  /**
   * Get payment result (for handling post-payment redirects)
   */
  async getPaymentResult(queryParams: Record<string, string>) {
    try {
      const response = await api.get('/payment/ipn', { params: queryParams });
      return response.data;
    } catch (error) {
      console.error('Error getting payment result:', error);
      throw error;
    }
  },

  async deleteBookingDraft(bookingId: string) {
    try {
      const response = await api.delete(`/booking/${bookingId}/delete-draft`);
      return response.data;
    } catch (error) {
      console.error('Error deleting booking:', error);
      throw error;
    }
  },

  async getActiveOperatingTime(facilityId: string) {
    try {
      const response = await api.get(`/facility/${facilityId}/active-time`);
      return response.data;
    } catch (error) {
      console.error('Error fetching active operating time:', error);
      throw error;
    }
  },

  async getBookingPlayer() {
    try {
      const response = await api.get(`/booking/player`);
      return response.data;
    } catch (error) {
      console.error('Error fetching booking detail:', error);
      throw error;
    }
  },

  async getBookingDetail(bookingId: string) {
    try {
      const response = await api.get(`/booking/${bookingId}/detail`);
      return response.data;
    } catch (error) {
      console.error('Error fetching booking detail:', error); 
      throw error;
    }
  },

  async getBookingSchedule(fieldGroupId: string, date: string) {
    try {
      const response = await api.get(`/booking/schedule`, {params: {
        fieldGroupId: fieldGroupId,
        date: date
      }});
      return response.data;
    } catch (error) {
      console.error('Error fetching booking schedule:', error);
      throw error;
    }
  },

  /**
   * Cancel a booking
   * @param bookingId The ID of the booking to cancel
   */
  async cancelBooking(bookingId: string) {
    try {
      const response = await api.put(`/booking/${bookingId}/cancel`);
      return response.data;
    } catch (error) {
      console.error('Error canceling booking:', error);
      throw error;
    }
  }
};

export default bookingService;
