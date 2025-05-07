import { Column, Entity, OneToMany, PrimaryColumn, Relation } from 'typeorm';
import { AggregateRoot } from '@nestjs/cqrs';
import { PlayerId } from 'src/gateway/shared-types/player-id';
import { UserCreatedEvent } from 'src/gateway/events/user/user-created.event';
import { UserRoleLifetimeEntity } from 'src/user/model/user-role-lifetime.entity';
import { Role } from 'src/gateway/shared-types/roles';
import { UserConnectionEntity } from 'src/user/model/user-connection.entity';

@Entity()
export class UserEntity extends AggregateRoot {
  @PrimaryColumn()
  steam_id: string;

  @Column({ default: '' })
  name: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ nullable: true })
  referral?: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  created_at: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  updated_at: Date;

  @OneToMany((type) => UserRoleLifetimeEntity, (t) => t.user, {
    eager: true,
  })
  roles: Relation<UserRoleLifetimeEntity>[];

  @OneToMany((type) => UserConnectionEntity, (t) => t.user, {
    eager: true,
  })
  connections: Relation<UserConnectionEntity>[];

  public get activeRoles(): Role[] {
    return this.roles.filter((t) => !t.isExpired).map((it) => it.role);
  }

  public created() {
    this.publish(new UserCreatedEvent(new PlayerId(this.steam_id)));
  }
}
