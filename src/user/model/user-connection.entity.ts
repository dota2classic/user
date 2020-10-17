import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { UserEntity } from './user.entity';
import { UserConnection } from '../../gateway/shared-types/user-connection';

@Entity()
export class UserConnectionEntity {
  @PrimaryColumn()
  steam_id: string;

  @ManyToOne(t => UserEntity)
  @JoinColumn({
    name: 'steam_id',
  })
  user!: UserEntity;

  @PrimaryColumn()
  external_id: string;

  @Column()
  connection: UserConnection;
}
