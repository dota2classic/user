import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HOST_PORT, REDIS_HOST, REDIS_PASSWORD, REDIS_URL } from './config/env';
import { Transport } from '@nestjs/microservices';
import { CommandBus, EventBus, EventPublisher, QueryBus } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { Subscriber } from 'rxjs';
import { UserEntity } from 'src/user/model/user.entity';
import { inspect } from 'util';
import { UserUpdatedEvent } from 'src/gateway/events/user/user-updated.event';

export function prepareModels(publisher: EventPublisher) {
  //
  publisher.mergeClassContext(UserEntity);
}

async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.REDIS,
    options: {
      url: REDIS_URL(),
      host: REDIS_HOST(),
      retryAttempts: Infinity,
      retryDelay: 5000,
      password: REDIS_PASSWORD(),
    },
  });

  const ebus = app.get(EventBus);
  const cbus = app.get(CommandBus);
  const qbus = app.get(QueryBus);

  const clogger = new Logger('CommandLogger');
  const elogger = new Logger('EventLogger');
  const qlogger = new Logger('QueryLogger');

  ebus.subscribe(e => {

    elogger.log(
      // `${inspect(e)}`,
      e.constructor.name,
    );
  })


  cbus.subscribe(e => {
    clogger.log(`${inspect(e)}, ${e.constructor.name}`);
  })

  qbus.subscribe(e => {
    qlogger.log(e.constructor.name);
  })


  await app.listen();


  const publisher = app.get(EventPublisher);
  prepareModels(publisher);
}
bootstrap();
