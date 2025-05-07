import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { UserEntity } from './user.entity';
import { UserConnection } from '../../gateway/shared-types/user-connection';

@Entity()
export class UserConnectionEntity {
  @PrimaryColumn({
    name: 'steam_id',
  })
  steamId: string;

  @ManyToOne((t) => UserEntity)
  @JoinColumn({
    name: 'steam_id',
  })
  user!: UserEntity;

  @Column({
    name: 'external_id',
  })
  externalId: string;

  @PrimaryColumn({
    type: 'enum',
    enum: UserConnection,
    enumName: 'user_external_connection',
  })
  connection: UserConnection;
}
