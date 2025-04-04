import { Booking, BookingStatus, PaymentStatus } from '@/types/booking.type';

export const mockBookings: Booking[] = [
  {
    id: '1',
    startTime: '09:00:00',
    endTime: '10:00:00',
    createdAt: '2024-03-20T08:00:00Z',
    updatedAt: '2024-03-20T08:00:00Z',
    status: BookingStatus.COMPLETED,
    voucherId: 1,
    playerId: 'player1',
    sportId: 1,
    bookingSlots: [
      {
        id: 1,
        date: '2024-03-21',
        fieldId: 1,
        bookingId: '1'
      }
    ],
    payment: {
      id: 'payment1',
      fieldPrice: 200000,
      servicePrice: 50000,
      discount: 20000,
      status: PaymentStatus.PAID,
      bookingId: '1'
    },
    additionalServices: [
      {
        serviceId: 1,
        bookingId: '1',
        quantity: 2
      }
    ]
  },
  {
    id: '2',
    startTime: '14:00:00',
    endTime: '15:00:00',
    createdAt: '2024-03-20T09:00:00Z',
    updatedAt: '2024-03-20T09:00:00Z',
    status: BookingStatus.DRAFT,
    playerId: 'player1',
    sportId: 2,
    bookingSlots: [
      {
        id: 2,
        date: '2024-03-22',
        fieldId: 2,
        bookingId: '2'
      }
    ],
    payment: {
      id: 'payment2',
      fieldPrice: 250000,
      servicePrice: 0,
      discount: 0,
      status: PaymentStatus.UNPAID,
      bookingId: '2'
    },
    additionalServices: []
  }
];

export const mockBookingHistory = mockBookings.map(booking => ({
  ...booking,
  facility: {
    id: 1,
    name: 'Sân bóng đá Hà Nội',
    address: '123 Nguyễn Văn Linh, Hà Nội'
  },
  sport: {
    id: booking.sportId,
    name: booking.sportId === 1 ? 'Football' : 'Badminton'
  },
  field: {
    id: booking.bookingSlots[0].fieldId,
    name: `Sân ${booking.bookingSlots[0].fieldId}`,
    fieldGroup: {
      id: 1,
      name: booking.sportId === 1 ? 'Sân 7 người' : 'Sân cầu lông',
      basePrice: booking.sportId === 1 ? 200000 : 250000
    }
  }
}));
