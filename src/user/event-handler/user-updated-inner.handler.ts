import { EventBus, EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { UserUpdatedInnerEvent } from 'src/user/event/user-updated-inner.event';
import { UserEntity } from 'src/user/model/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRoleLifetimeEntity } from 'src/user/model/user-role-lifetime.entity';
import { UserUpdatedEvent } from 'src/gateway/events/user/user-updated.event';
import { UserEntry } from 'src/gateway/queries/GetAll/get-all-query.result';
import { PlayerId } from 'src/gateway/shared-types/player-id';
import { UserProfileFastService } from '@dota2classic/caches/dist/service/user-profile-fast.service';
import { UserFastProfileDto } from 'src/gateway/caches/user-fast-profile.dto';
import { UserConnectionEntity } from 'src/user/model/user-connection.entity';

@EventsHandler(UserUpdatedInnerEvent)
export class UserUpdatedInnerHandler
  implements IEventHandler<UserUpdatedInnerEvent>
{
  constructor(
    @InjectRepository(UserEntity)
    private readonly userEntityRepository: Repository<UserEntity>,
    @InjectRepository(UserRoleLifetimeEntity)
    private readonly userRoleLifetimeEntityRepository: Repository<UserRoleLifetimeEntity>,
    @InjectRepository(UserConnectionEntity)
    private readonly userConnectionEntityRepository: Repository<UserConnectionEntity>,
    private readonly ebus: EventBus,
    private readonly user: UserProfileFastService<UserFastProfileDto>,
  ) {}

  async handle(event: UserUpdatedInnerEvent) {
    const user = await this.userEntityRepository.findOneOrFail({
      where: { steam_id: event.steamId },
    });

    this.ebus.publish(
      new UserUpdatedEvent(
        new UserEntry(
          new PlayerId(event.steamId),
          user.name,
          user.avatar,
          user.activeRoles,
        ),
      ),
    );

    await this.user.save(
      {
        steamId: event.steamId,
        name: user.name,
        avatar: user.avatar,
        roles: user.activeRoles,
        connections: user.connections.map((it) => ({
          connection: it.connection,
          externalId: it.externalId,
        })),
      },
      0,
    );
  }
}
