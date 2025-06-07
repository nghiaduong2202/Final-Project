import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Event } from './event.entity';

@Entity()
export class Prize {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  position: string;

  @Column({
    type: 'int4',
    nullable: false,
  })
  prize: number;

  @ManyToOne(() => Event, (event) => event.prizes)
  @JoinColumn()
  event: Event;
}
