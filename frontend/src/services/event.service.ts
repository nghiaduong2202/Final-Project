import api from './api';
import { Event, EventFormData } from '@/types/event.type';

// Define params interface
interface EventParams {
  facilityId?: string;
  status?: string;
  [key: string]: string | undefined;
}

// API Endpoints for Events
export const eventService = {
  /**
   * Get all events
   * @param facilityId Optional facility ID filter
   * @param status Optional status filter
   * @returns Promise with events array
   */
  getEvents: async (facilityId?: string, status?: string): Promise<Event[]> => {
    try {
      const params: EventParams = {};
      if (facilityId) params.facilityId = facilityId;
      if (status && status !== 'all') params.status = status;

      const response = await api.get('/events', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  },

  /**
   * Get a single event by ID
   * @param eventId Event ID
   * @returns Promise with event data
   */
  getEventById: async (eventId: number): Promise<Event> => {
    try {
      const response = await api.get(`/events/${eventId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching event ${eventId}:`, error);
      throw error;
    }
  },

  /**
   * Create a new event
   * @param eventData Event form data
   * @returns Promise with created event
   */
  createEvent: async (eventData: EventFormData): Promise<Event> => {
    try {
      const response = await api.post('/events', eventData);
      return response.data;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  },

  /**
   * Update an existing event
   * @param eventId Event ID
   * @param eventData Updated event data
   * @returns Promise with updated event
   */
  updateEvent: async (eventId: number, eventData: Partial<EventFormData>): Promise<Event> => {
    try {
      const response = await api.put(`/events/${eventId}`, eventData);
      return response.data;
    } catch (error) {
      console.error(`Error updating event ${eventId}:`, error);
      throw error;
    }
  },

  /**
   * Delete an event
   * @param eventId Event ID
   * @returns Promise with deletion confirmation
   */
  deleteEvent: async (eventId: number): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.delete(`/events/${eventId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting event ${eventId}:`, error);
      throw error;
    }
  },

  /**
   * Get events for a specific facility
   * @param facilityId Facility ID
   * @returns Promise with events array
   */
  getEventsByFacility: async (facilityId: string): Promise<Event[]> => {
    try {
      const response = await api.get(`/facilities/${facilityId}/events`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching events for facility ${facilityId}:`, error);
      throw error;
    }
  }
};

