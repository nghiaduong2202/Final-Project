import { Field } from 'src/fields/field.entity';
import { BookingSlot } from './booking-slot.entity';
import { Booking } from 'src/bookings/booking.entity';
import { EntityManager } from 'typeorm';
import { UUID } from 'crypto';

export interface IBookingSlotService {
  createWithTransaction(
    field: Field,
    date: Date,
    booking: Booking,
    manager: EntityManager,
  ): Promise<BookingSlot>;

  findOneByIdAndPlayer(
    bookingSlotId: number,
    playerId: UUID,
    relations?: string[],
  ): Promise<BookingSlot>;

  getManyForPlaymate(playerId: UUID): Promise<BookingSlot[]>;
}
