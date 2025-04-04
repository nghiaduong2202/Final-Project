import { Dayjs } from 'dayjs';

export enum BookingStatus {
  DRAFT = 'draft',
  COMPLETED = 'completed'
}

export enum PaymentStatus {
  UNPAID = 'unpaid',
  PAID = 'paid',
  CANCELLED = 'cancelled'
}

export enum RecurringType {
  NONE = 'none',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly'
}

export interface RecurringConfig {
  type: RecurringType;
  startDate: Dayjs;
  endDate: Dayjs;
  daysOfWeek?: number[]; // 0-6 for Sunday-Saturday
  daysOfMonth?: number[]; // 1-31
}

export interface BookingSlot {
  id: number;
  date: string;
  fieldId: number;
  bookingId: string;
}

export interface Payment {
  id: string;
  fieldPrice: number;
  servicePrice: number;
  discount: number;
  status: PaymentStatus;
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
  isRecurring: boolean;
  recurringConfig?: RecurringConfig;
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
