import { UUID } from 'crypto';
import { RegisterDto } from 'src/auths/dtos/requests/register.dto';
import { Person } from 'src/people/person.entity';
import { MessageResponseDto } from './dtos/responses/message-response.dto';
import { UpdatePersonDto } from './dtos/requests/update-person.dto';
import { EntityManager } from 'typeorm';

export interface IPersonService {
  findOneByEmail(email: string): Promise<Person>;

  createOne(registerDto: RegisterDto): Promise<Person>;

  findOneById(personId: UUID): Promise<Person>;

  getAll(): Promise<Person[]>;

  updateAvatatar(
    image: Express.Multer.File,
    personId: UUID,
  ): Promise<MessageResponseDto>;

  updateInfo(
    updatePersonDto: UpdatePersonDto,
    personId: UUID,
  ): Promise<MessageResponseDto>;

  findOneByIdWithTransaction(
    personId: UUID,
    manage: EntityManager,
  ): Promise<Person>;
}
