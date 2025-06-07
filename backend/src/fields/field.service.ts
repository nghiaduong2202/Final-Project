import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IFieldService } from './ifield.service';
import { UUID } from 'crypto';
import { CreateManyFieldsDto } from './dtos/requests/create-many-fields';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { Field } from './field.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { FieldGroupService } from 'src/field-groups/field-group.service';
import { FieldGroup } from 'src/field-groups/field-group.entity';
import { CreateFieldDto } from './dtos/requests/create-field.dto';
import { UpdateFieldDto } from './dtos/requests/update-field.dto';

@Injectable()
export class FieldService implements IFieldService {
  constructor(
    /**
     * inject FieldRepository
     */
    @InjectRepository(Field)
    private readonly fieldRepositoy: Repository<Field>,
    /**
     * inject FieldGroupService
     */
    private readonly fieldGroupService: FieldGroupService,
    /**
     * inject DataSource
     */
    private readonly dataSource: DataSource,
  ) {}

  public async findOneById(
    fieldId: number,
    relations?: string[],
  ): Promise<Field> {
    return await this.fieldRepositoy
      .findOneOrFail({
        relations,
        where: {
          id: fieldId,
        },
      })
      .catch(() => {
        throw new NotFoundException(`Not found the field id: ${fieldId}`);
      });
  }

  public async createMany(
    createManyFieldsDto: CreateManyFieldsDto,
    fieldGroupId: UUID,
    ownerId: UUID,
  ): Promise<{ message: string }> {
    const fieldGroup = await this.fieldGroupService.findOneByIdAndOwnerId(
      fieldGroupId,
      ownerId,
    );

    // craete fields
    await this.dataSource.transaction(async (manager) => {
      for (const field of createManyFieldsDto.fields) {
        await this.createWithTransaction(field, fieldGroup, manager);
      }
    });

    return {
      message: 'Craete many fields successful',
    };
  }

  public async createWithTransaction(
    createFieldDto: CreateFieldDto,
    fieldGroup: FieldGroup,
    manager: EntityManager,
  ): Promise<Field> {
    const field = manager.create(Field, {
      ...createFieldDto,
      fieldGroup,
    });

    return await manager.save(field);
  }

  public async findOneByIdAndOnwerId(
    id: number,
    ownerId: UUID,
  ): Promise<Field> {
    return await this.fieldRepositoy
      .findOneOrFail({
        where: {
          id,
          fieldGroup: {
            facility: {
              owner: {
                id: ownerId,
              },
            },
          },
        },
      })
      .catch(() => {
        throw new NotFoundException(
          `Not found field with id: ${id} of owner: ${ownerId}`,
        );
      });
  }

  public async update(
    updateFieldDto: UpdateFieldDto,
    ownerId: UUID,
  ): Promise<{ message: string }> {
    const field = await this.findOneByIdAndOnwerId(updateFieldDto.id, ownerId);

    if (updateFieldDto.name) field.name = updateFieldDto.name;

    try {
      await this.fieldRepositoy.save(field);
    } catch {
      throw new BadRequestException('Error occurred when update field');
    }

    return {
      message: 'Update field successful',
    };
  }

  public async delete(
    fieldId: number,
    ownerId: UUID,
  ): Promise<{ message: string }> {
    const field = await this.findOneByIdAndOnwerId(fieldId, ownerId);

    try {
      await this.fieldRepositoy.remove(field);
    } catch {
      throw new BadRequestException('An error occurred when delete field');
    }

    return {
      message: 'Delete field successful',
    };
  }

  public async findOneByIdWithTransaction(
    fieldId: number,
    manager: EntityManager,
    relations?: string[],
  ): Promise<Field> {
    return await manager
      .findOneOrFail(Field, {
        relations,
        where: {
          id: fieldId,
        },
      })
      .catch(() => {
        throw new NotFoundException(`Not found field id: ${fieldId}`);
      });
  }
}
