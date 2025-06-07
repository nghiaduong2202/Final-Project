import { UUID } from 'crypto';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Conversation } from './conversation.entity';
import { Person } from 'src/people/person.entity';
import { Message } from './message.entity';

@Entity()
export class Participant {
  @PrimaryColumn()
  conversationId: UUID;

  @PrimaryColumn()
  personId: UUID;

  @Column({
    type: 'bool',
    default: false,
  })
  isAdmin: boolean;

  @CreateDateColumn({
    type: 'timestamptz',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamptz',
  })
  updatedAt: Date;

  @ManyToOne(() => Conversation, (conversation) => conversation.participants, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'conversationId',
  })
  conversation: Conversation;

  @ManyToOne(() => Person, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'personId',
  })
  person: Person;

  @ManyToOne(() => Message, {
    onDelete: 'RESTRICT',
    nullable: true,
  })
  @JoinColumn()
  seen?: Message;
}
