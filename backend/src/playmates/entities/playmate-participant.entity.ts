import { UUID } from 'crypto';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Playmate } from './playmate.entity';
import { Person } from 'src/people/person.entity';
import { ParticipantStatusEnum } from '../enums/participant-status.enum';
import { SkillLevelEnum } from '../enums/skill-level.enum';

@Entity()
export class PlaymateParticipant {
  @PrimaryColumn()
  playmateId: UUID;

  @PrimaryColumn()
  playerId: UUID;

  @ManyToOne(() => Playmate, (playmate) => playmate.participants, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({
    name: 'playmateId',
  })
  playmate: Playmate;

  @ManyToOne(() => Person, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'playerId',
  })
  player: Person;

  @Column({
    type: 'enum',
    enum: ParticipantStatusEnum,
    default: ParticipantStatusEnum.PENDING,
  })
  status: ParticipantStatusEnum;

  @Column({
    type: 'enum',
    enum: SkillLevelEnum,
  })
  skillLevel: SkillLevelEnum;

  @Column({
    type: 'text',
    nullable: true,
  })
  note?: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  position?: string;
}
