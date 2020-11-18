import { EventBus, ofType } from '@nestjs/cqrs';
import { Inject, Injectable } from '@nestjs/common';
import { UserUpdatedEvent } from 'src/gateway/events/user/user-updated.event';
import { UserCreatedEvent } from 'src/gateway/events/user/user-created.event';
import { ClientProxy } from '@nestjs/microservices';
import { UserConnectionCreatedEvent } from 'src/gateway/events/user/user-connection-created.event';

@Injectable()
export class AppService {
  constructor(
    private readonly ebus: EventBus,
    @Inject('QueryCore') private readonly redisEventQueue: ClientProxy,
  ) {}

  async onApplicationBootstrap() {
    try {
      await this.redisEventQueue.connect();
    } catch (e) {}

    const publicEvents: any[] = [UserUpdatedEvent, UserCreatedEvent, UserConnectionCreatedEvent];

    this.ebus
      .pipe(ofType(...publicEvents))
      .subscribe(t => this.redisEventQueue.emit(t.constructor.name, t));
  }
}
