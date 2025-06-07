import { UUID } from 'crypto';
import { Booking } from 'src/bookings/booking.entity';
import { Service } from 'src/services/service.entity';
import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';

@Entity()
export class AdditionalService {
  @PrimaryColumn()
  serviceId: number;

  @PrimaryColumn()
  bookingId: UUID;

  @Column({
    type: 'integer',
    nullable: false,
    default: 1,
  })
  quantity: number;

  @ManyToOne(() => Service, (service) => service.additionalServices, {
    nullable: false,
  })
  service: Service;

  @ManyToOne(() => Booking, (booking) => booking.additionalServices, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  booking: Booking;
}
