import { Column, Entity, PrimaryColumn } from 'typeorm';
import { Role } from 'src/gateway/shared-types/roles';
import { AggregateRoot } from '@nestjs/cqrs';
import { UserUpdatedEvent } from 'src/gateway/events/user/user-updated.event';
import { UserEntry } from 'src/gateway/queries/GetAll/get-all-query.result';
import { PlayerId } from 'src/gateway/shared-types/player-id';
import { UserCreatedEvent } from 'src/gateway/events/user/user-created.event';

@Entity()
export class UserEntity extends AggregateRoot {
  @PrimaryColumn()
  steam_id: string;

  @Column({ default: '' })
  name: string;

  @Column({ nullable: true })
  avatar: string;

  @Column('varchar', { default: `${Role.PLAYER}` })
  private roles: string = '';

  public get userRoles(): Role[] {
    return this.roles.split(',') as Role[];
  }

  public set userRoles(r: Role[]) {
    this.roles = this.userRoles
      .concat(r)
      .filter((value, index, self) => self.indexOf(value) === index)
      .join(',');
  }

  public updated() {
    this.publish(
      new UserUpdatedEvent(
        new UserEntry(
          new PlayerId(this.steam_id),
          this.name,
          this.avatar,
          this.userRoles,
        ),
      ),
    );
  }

  public created() {
    this.publish(new UserCreatedEvent(new PlayerId(this.steam_id)));
  }
}
