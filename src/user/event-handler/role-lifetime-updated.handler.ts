import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { RoleLifetimeUpdatedEvent } from 'src/user/event/role-lifetime-updated.event';
import { UserRoleLifetimeEntity } from 'src/user/model/user-role-lifetime.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@EventsHandler(RoleLifetimeUpdatedEvent)
export class RoleLifetimeUpdatedHandler
  implements IEventHandler<RoleLifetimeUpdatedEvent> {
  constructor(
    @InjectRepository(UserRoleLifetimeEntity)
    private readonly userRoleLifetimeEntityRepository: Repository<
      UserRoleLifetimeEntity
    >,
  ) {}

  async handle(event: RoleLifetimeUpdatedEvent) {
    const lft = await this.userRoleLifetimeEntityRepository.findOne({
      where: {
        steam_id: event.steam_id,
        role: event.role,
      }
    });
    if (!lft) return;
  }
}
