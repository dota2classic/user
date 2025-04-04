import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { UserMightExistEvent } from 'src/gateway/events/user/user-might-exist.event';
import { UserEntity } from 'src/user/model/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@EventsHandler(UserMightExistEvent)
export class UserMightExistHandler
  implements IEventHandler<UserMightExistEvent> {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userEntityRepository: Repository<UserEntity>,
  ) {}

  async handle(event: UserMightExistEvent) {
    // I dont think i want this
    // const existing = await this.userEntityRepository.findOne({
    //   where: {
    //     steam_id: event.id.value,
    //   }
    // });
    // if (!existing) {
    //   const u = new UserEntity();
    //   u.created_at = new Date();
    //   u.steam_id = event.id.value;
    //   await this.userEntityRepository.save(u);
    // }
  }
}
