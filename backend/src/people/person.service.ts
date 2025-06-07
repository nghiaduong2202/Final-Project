import {
  BadRequestException,
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { IPersonService } from './iperson.service';
import { Person } from './person.entity';
import { EntityManager, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { RegisterDto } from 'src/auths/dtos/requests/register.dto';
import { PersonRoleEnum } from './enums/person-role.enum';
import { UUID } from 'crypto';
import { MessageResponseDto } from './dtos/responses/message-response.dto';
import { CloudUploaderService } from 'src/cloud-uploader/cloud-uploader.service';
import { UpdatePersonDto } from './dtos/requests/update-person.dto';

@Injectable()
export class PersonService implements IPersonService {
  constructor(
    /**
     * inject personRepository
     */
    @InjectRepository(Person)
    private readonly personRepository: Repository<Person>,
    /**
     * inject CloudUploaderService
     */
    private readonly cloudUploaderService: CloudUploaderService,
  ) {}

  public async findOneByEmail(email: string): Promise<Person> {
    const person = await this.personRepository
      .findOneOrFail({
        where: {
          email,
        },
      })
      .catch(() => {
        throw new NotFoundException(`Person not found with email ${email}`);
      });

    return person;
  }

  public async createOne(registerDto: RegisterDto): Promise<Person> {
    // Not allow create new person with admin role
    if (registerDto.role === PersonRoleEnum.ADMIN) {
      throw new NotAcceptableException(
        'You do not have permission to register admin acoount',
      );
    }

    try {
      const person = this.personRepository.create(registerDto);

      return await this.personRepository.save(person);
    } catch (error) {
      throw new BadRequestException(String(error));
    }
  }

  public async findOneById(personId: UUID): Promise<Person> {
    const person = await this.personRepository
      .findOneOrFail({
        where: {
          id: personId,
        },
      })
      .catch(() => {
        throw new NotFoundException(`Not found person with id: ${personId}`);
      });

    return person;
  }

  public async getAll(): Promise<Person[]> {
    return await this.personRepository.find();
  }

  public async updateAvatatar(
    image: Express.Multer.File,
    personId: UUID,
  ): Promise<MessageResponseDto> {
    // check type of image
    if (!image.mimetype.includes('image')) {
      throw new BadRequestException('Avatar must be images');
    }

    const person = await this.findOneById(personId);

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const { secure_url } = await this.cloudUploaderService.upload(image);

      // remove old avatar when update avata, later

      person.avatarUrl = String(secure_url);

      await this.personRepository.save(person);
    } catch {
      throw new BadRequestException('Error occur when update avatar');
    }

    return {
      message: 'Update avatar successful',
    };
  }

  public async updateInfo(
    updatePersonDto: UpdatePersonDto,
    personId: UUID,
  ): Promise<MessageResponseDto> {
    const person = await this.findOneById(personId);

    if (updatePersonDto.name) person.name = updatePersonDto.name;

    if (updatePersonDto.email) {
      const personWithEmail = await this.personRepository.findOneBy({
        email: updatePersonDto.email,
      });

      if (personWithEmail) {
        throw new BadRequestException('Email already exists');
      }

      person.email = updatePersonDto.email;
    }

    if (updatePersonDto.phoneNumber)
      person.phoneNumber = updatePersonDto.phoneNumber;

    if (updatePersonDto.gender) person.gender = updatePersonDto.gender;

    if (updatePersonDto.dob) person.dob = updatePersonDto.dob;

    if (updatePersonDto.bankAccount)
      person.bankAccount = updatePersonDto.bankAccount;

    try {
      await this.personRepository.save(person);
    } catch {
      throw new BadRequestException('Erro occur when update info');
    }

    return {
      message: 'Update info successful',
    };
  }

  public async findOneByIdWithTransaction(
    personId: UUID,
    manage: EntityManager,
  ): Promise<Person> {
    return manage
      .findOneOrFail(Person, {
        where: {
          id: personId,
        },
      })
      .catch(() => {
        throw new NotFoundException(`Not found person with id: ${personId}`);
      });
  }
}
