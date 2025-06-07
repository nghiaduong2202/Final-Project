import { UUID } from 'crypto';
import { CreateManyFieldsDto } from './dtos/requests/create-many-fields';
import { Field } from './field.entity';
import { CreateFieldDto } from './dtos/requests/create-field.dto';
import { FieldGroup } from 'src/field-groups/field-group.entity';
import { EntityManager } from 'typeorm';
import { UpdateFieldDto } from './dtos/requests/update-field.dto';

export interface IFieldService {
  createMany(
    createManyFieldsDto: CreateManyFieldsDto,
    fieldGroupId: UUID,
    ownerId: UUID,
  ): Promise<{ message: string }>;

  createWithTransaction(
    craeteFieldDto: CreateFieldDto,
    fieldGroup: FieldGroup,
    manager: EntityManager,
  ): Promise<Field>;

  findOneByIdAndOnwerId(id: number, ownerId: UUID): Promise<Field>;

  update(
    updateFieldDto: UpdateFieldDto,
    ownerId: UUID,
  ): Promise<{ message: string }>;

  delete(fieldId: number, ownerId: UUID): Promise<{ message: string }>;

  findOneById(fieldId: number, relations?: string[]): Promise<Field>;

  findOneByIdWithTransaction(
    fieldId: number,
    manager: EntityManager,
    relations?: string[],
  ): Promise<Field>;
}
