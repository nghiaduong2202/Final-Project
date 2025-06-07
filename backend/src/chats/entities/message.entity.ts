import { UUID } from 'crypto';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Conversation } from './conversation.entity';
import { Person } from 'src/people/person.entity';

@Entity()
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: UUID;

  @Column({
    type: 'text',
    nullable: true,
  })
  content?: string;

  @CreateDateColumn({
    type: 'timestamptz',
  })
  createdAt: Date;

  @Column({
    type: 'varchar',
    array: true,
    nullable: true,
  })
  images?: string[];

  @ManyToOne(() => Conversation, (conversation) => conversation.messages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  conversation: Conversation;

  @ManyToOne(() => Person, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  sender: Person;
}
