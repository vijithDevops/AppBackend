import {
  Entity,
  PrimaryGeneratedColumn,
  Index,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
} from 'typeorm';
import { User } from '../../user/entity/user.entity';
import { GraphTypes } from '../constants/graphtypes.enum';

@Entity()
export class TrendsSettings {
  @PrimaryGeneratedColumn('uuid')
  @Index('trends_settings_id_uidx', { unique: true })
  id: string;

  @Column({ name: 'refArr', type: 'varchar', array: true })
  refArr: GraphTypes[];

  @PrimaryColumn({ name: 'patientId', type: 'varchar' })
  patientId: string;

  @PrimaryColumn({ name: 'user_id' })
  userId: string;
  @ManyToOne(() => User, (user) => user.trendsSettings)
  @JoinColumn({
    name: 'user_id',
  })
  user: User;
}

@Entity()
export class UserTrendsSettings{
  @PrimaryGeneratedColumn('uuid')
  @Index('user_trends_settings_uuid')
  id:string;

  @PrimaryColumn({ name: 'tableName' })
  tableName:string;

  @Column({ name: 'userId', nullable:false })
  userId:string;
  @ManyToOne(() => User, (user) => user.userTrendsSettings)
  @JoinColumn({
    name: 'userId',
    referencedColumnName: 'id'
  })
  user:User;
  
  @Column({ name: 'patientId', type: 'varchar', nullable:true })
  patientId:string;
  @ManyToOne(() => User, (user) => user.userTrendsSettings)
  @JoinColumn({
    name: 'patientId',
    referencedColumnName: 'id'
  })
  patient:User;

  @Column( { name: 'columnsOrder', type: 'varchar', array:true })
  columnsOrder: string[];
}

@Entity()
export class DefaultTrendsSettings{
  @PrimaryGeneratedColumn('uuid')
  @Index('default_trends_settings_uuid')
  id:string;

  @PrimaryColumn({ name: 'tableName' })
  tableName:string;

  @Column({ name: 'columnsOrder', type: 'varchar', array:true })
  columnsOrder: string[];

  @Column({ name: 'requirePatientId', nullable: false })
  requirePatientId: Boolean; // use enum value user patient 
}