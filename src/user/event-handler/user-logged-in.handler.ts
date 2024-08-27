import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { UserLoggedInEvent } from 'src/gateway/events/user/user-logged-in.event';
import { UserEntity } from 'src/user/model/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@EventsHandler(UserLoggedInEvent)
export class UserLoggedInHandler implements IEventHandler<UserLoggedInEvent> {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userEntityRepository: Repository<UserEntity>,
  ) {}

  async handle(event: UserLoggedInEvent) {
    let u = await this.userEntityRepository.findOne({
      where: {
        steam_id: event.playerId.value,
      }
    });

    if (!u) {
      u = new UserEntity();
      u.steam_id = event.playerId.value;
      u.name = event.name;
      u.avatar = event.avatar;
      u.userRoles = [];
      await this.userEntityRepository.save(u);
      u.created();
      u.updated();
      u.commit();
    } else {
      u.name = event.name;
      u.avatar = event.avatar;
      await this.userEntityRepository.save(u);
      u.updated();
      u.commit();
    }
  }
}
