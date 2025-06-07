import { UUID } from 'crypto';
import { CreatePlaymateDto } from './dtos/create-playmate.dto';
import { UpdatePlaymateDto } from './dtos/update-playmate.dto';
import { Playmate } from './entities/playmate.entity';
import { RegisterPlaymateDto } from './dtos/register-playmate.dto';
import { ParticipantDto } from './dtos/participant.dto';
import { ParticipantStatusEnum } from './enums/participant-status.enum';

export interface IPlaymateService {
  create(
    createPlaymateDto: CreatePlaymateDto,
    playerId: UUID,
  ): Promise<{ message: string }>;

  update(
    updatePlaymateDto: UpdatePlaymateDto,
    playerId: UUID,
  ): Promise<{ message: string }>;

  register(
    registerPlaymateDto: RegisterPlaymateDto,
    playerId: UUID,
  ): Promise<{ message: string }>;

  getMany(): Promise<Playmate[]>;

  getDetail(playmateId: UUID): Promise<Playmate>;

  getMyPost(playerId: UUID): Promise<Playmate[]>;

  getMyRegister(playerId: UUID): Promise<Playmate[]>;

  decideRegister(
    participantDto: ParticipantDto,
    playerId: UUID,
    status: ParticipantStatusEnum,
  ): Promise<{ message: string }>;
}
