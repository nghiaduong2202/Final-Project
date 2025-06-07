import { UUID } from 'crypto';
import { Booking } from './booking.entity';
import { CreateDraftBookingDto } from './dtos/requests/create-draft-booking.dto';
import { UpdateBookingSlotDto } from './dtos/requests/update-booking-slot.dto';
import { UpdateAdditionalServicesDto } from './dtos/requests/update-additional-services.dto';
import { GetScheduleDto } from './dtos/requests/get-schedule.dto';
import { CreateDraftBookingByOwnerDto } from './dtos/requests/create-draft-booking-by-owner.dto';

export interface IBookingService {
  createDraft(
    createDraftBookingDto: CreateDraftBookingDto,
    playerId: UUID,
  ): Promise<Booking>;

  updateBookingSlot(
    bookingId: UUID,
    updateBookingSlotDto: UpdateBookingSlotDto,
    playerId: UUID,
  ): Promise<Booking>;

  findOneByIdAndPlayer(
    bookingId: UUID,
    playerId: UUID,
    relations?: string[],
  ): Promise<Booking>;

  updateAdditionalServices(
    bookingId: UUID,
    updateAdditionalServiceDto: UpdateAdditionalServicesDto,
    playerId?: UUID,
  ): Promise<Booking>;

  findOneById(bookingId: UUID, relations?: string[]): Promise<Booking>;

  getManyByPlayer(playerId: UUID): Promise<any[]>;

  deleteDraft(bookingId: UUID, playerId: UUID): Promise<{ message: string }>;

  getDetail(bookingId: UUID): Promise<any>;

  getSchedule(getScheduleDto: GetScheduleDto, ownerId: UUID): Promise<any[]>;

  getManyByOwner(ownerID: UUID, facilityId?: UUID): Promise<any[]>;

  save(booking: Booking): Promise<any>;

  cancelBooking(bookingId: UUID, playerId: UUID): Promise<{ message: string }>;

  createDraftByOwner(
    createDraftBookingByOnwerDto: CreateDraftBookingByOwnerDto,
    ownerId: UUID,
  ): Promise<Booking>;
}
