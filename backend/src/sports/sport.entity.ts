import { FieldGroup } from 'src/field-groups/field-group.entity';
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Sport {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
    unique: true,
  })
  name: string;

  @ManyToMany(() => FieldGroup, (fieldGroup) => fieldGroup.sports)
  fieldGroups: FieldGroup[];
}
