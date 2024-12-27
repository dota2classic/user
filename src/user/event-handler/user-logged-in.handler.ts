import { EventBus, EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { UserLoggedInEvent } from 'src/gateway/events/user/user-logged-in.event';
import { UserEntity } from 'src/user/model/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserCreatedEvent } from 'src/gateway/events/user/user-created.event';
import { PlayerId } from 'src/gateway/shared-types/player-id';
import { UserUpdatedInnerEvent } from 'src/user/event/user-updated-inner.event';

@EventsHandler(UserLoggedInEvent)
export class UserLoggedInHandler implements IEventHandler<UserLoggedInEvent> {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userEntityRepository: Repository<UserEntity>,
    private readonly ebus: EventBus,
  ) {}

  async handle(event: UserLoggedInEvent) {
    let u = await this.userEntityRepository.findOne({
      where: {
        steam_id: event.playerId.value,
      },
    });

    if (!u) {
      u = new UserEntity();
      u.steam_id = event.playerId.value;
      u.name = event.name;
      u.avatar = event.avatar;
      u.created_at = new Date();
      u.referral = event.referral || null;
      await this.userEntityRepository.save(u);
      this.ebus.publish(new UserCreatedEvent(new PlayerId(u.steam_id)));
    } else {
      u.name = event.name;
      u.avatar = event.avatar;
      // What if user was created by opening profile? We need to set referral after all
      if (!u.referral && event.referral) {
        u.referral = event.referral || null;
      }
      await this.userEntityRepository.save(u);
    }

    this.ebus.publish(new UserUpdatedInnerEvent(u.steam_id));
  }
}
