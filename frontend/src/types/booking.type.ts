import { Dayjs } from 'dayjs';

export enum BookingStatus {
  INCOMPLETE = 'incomplete',
  COMPLETED = 'completed',  
  CANCELED = 'canceled',
}

export enum BookingSlotStatus {
  UPCOMING = 'upcoming',
  DONE = 'done',
  CANCELED = 'canceled',
}

export enum HistoryBookingStatus {
  PENDING = 'pending',  
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'canceled',  
}

export enum RecurringType {
  NONE = 'none',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY_BY_DAY = 'monthly_by_day',
  MONTHLY_BY_DATE = 'monthly_by_date',
  YEARLY = 'yearly',
  CUSTOM = 'custom',
  SAME_WEEK = 'same_week'
}

export interface RecurringConfig {
  type: RecurringType;
  startDate: Dayjs;
  endDate?: Dayjs;
  daysOfWeek?: number[]; // 0-6 for Sunday-Saturday
  daysOfMonth?: number[]; // 1-31
  frequency?: number; // For every X days/weeks/months
  endType?: 'never' | 'on_date' | 'after_occurrences';
  endOccurrences?: number;
}

export interface BookingSlot {
  id: number;
  date: string;
  fieldId: number;
  status: BookingSlotStatus;
  bookingId: string;
}

export interface Payment {
  id: string;
  fieldPrice: number;
  servicePrice: number;
  discount: number;
  refundedPoint: number;
  refund: number;
  bookingId: string;
}

export interface AdditionalService {
  serviceId: number;
  bookingId: string;
  quantity: number;
}

export interface Booking {
  id: string;
  startTime: string;
  endTime: string;
  createdAt: string;
  updatedAt: string;
  status: BookingStatus;
  voucherId?: number;
  playerId: string;
  sportId: number;
  bookingSlots: BookingSlot[];
  payment: Payment;
  additionalServices: AdditionalService[];
  recurringConfig?: RecurringConfig;
}

export interface BookingFormData {
  sportId: number;
  date: Dayjs;
  timeRange: [Dayjs, Dayjs];
  fieldGroupId?: number;
  fieldId?: number;
  services: {
    serviceId: number;
    quantity: number;
  }[];
  paymentMethod: 'banking' | 'momo' | 'vnpay' | 'cash';
  voucherCode?: string;
  voucherId?: number;
  isRecurring: boolean;
  recurringConfig?: RecurringConfig;
  recurringOption?: string;
  refundedPoint?: number;
}

export interface BookingSummary {
  fieldPrice: number;
  servicePrice: number;
  discount: number;
  totalPrice: number;
}

export interface FieldAvailability {
  fieldId: number;
  fieldName: string;
  isAvailable: boolean;
  reason?: string;
}

export interface FieldGroupAvailability {
  fieldGroupId: number;
  fieldGroupName: string;
  basePrice: number;
  fields: FieldAvailability[];
}
