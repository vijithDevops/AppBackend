import { Entity, Column, Index, PrimaryGeneratedColumn } from 'typeorm';

import { ConstantsValueType } from './constants.enum';

@Entity()
export class Constants {
  @PrimaryGeneratedColumn('uuid')
  @Index('constants_id_uidx', { unique: true })
  id: string;

  @Column({ name: 'key', type: 'varchar', length: 200 })
  key: string;

  @Column({ name: 'value', type: 'text' })
  value: string;

  @Column({ name: 'description', nullable: true, type: 'text' })
  description?: string;

  @Column({
    name: 'value_type',
    type: 'enum',
    enum: ConstantsValueType,
    default: ConstantsValueType.NUMBER,
  })
  valueType: string;
}
