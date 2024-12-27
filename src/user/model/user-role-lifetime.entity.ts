import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import { Role } from 'src/gateway/shared-types/roles';
import { UserEntity } from 'src/user/model/user.entity';

@Entity()
export class UserRoleLifetimeEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => UserEntity, (t) => t.roles)
  @JoinColumn([
    {
      name: 'steam_id',
      referencedColumnName: 'steam_id',
    },
  ])
  user: Relation<UserEntity>;

  @Column()
  steam_id: string;

  @CreateDateColumn()
  created_at: Date;

  @Column()
  end_time: Date;

  @Column()
  role!: Role;

  public get isExpired(): boolean {
    return new Date().getTime() > this.end_time.getTime();
  }
}
