import { EventBus, EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { RoleLifetimeUpdatedEvent } from 'src/user/event/role-lifetime-updated.event';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/model/user.entity';
import { UserUpdatedInnerEvent } from 'src/user/event/user-updated-inner.event';

@EventsHandler(RoleLifetimeUpdatedEvent)
export class RoleLifetimeUpdatedHandler
  implements IEventHandler<RoleLifetimeUpdatedEvent>
{
  constructor(
    @InjectRepository(UserEntity)
    private readonly userEntityRepository: Repository<UserEntity>,
    private readonly ebus: EventBus,
  ) {}

  async handle(event: RoleLifetimeUpdatedEvent) {
    this.ebus.publish(new UserUpdatedInnerEvent(event.steam_id));
  }
}
