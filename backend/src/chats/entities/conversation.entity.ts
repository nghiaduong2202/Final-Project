import { UUID } from 'crypto';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Participant } from './participant.entity';
import { Message } from './message.entity';

@Entity()
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: UUID;

  @Column({
    type: 'bool',
  })
  isGroup: boolean;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  title?: string;

  @CreateDateColumn({
    type: 'timestamptz',
  })
  createdAt: Date;

  @OneToMany(() => Participant, (participants) => participants.conversation)
  participants: Participant[];

  @OneToMany(() => Message, (messages) => messages.conversation)
  messages: Message[];
}
