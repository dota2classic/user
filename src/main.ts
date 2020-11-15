import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HOST_PORT, REDIS_PASSWORD, REDIS_URL } from './config/env';
import { Transport } from '@nestjs/microservices';
import { CommandBus, EventBus, EventPublisher, QueryBus } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { Subscriber } from 'rxjs';
import { UserEntity } from 'src/user/model/user.entity';
import { inspect } from 'util';

export function prepareModels(publisher: EventPublisher) {
  //
  publisher.mergeClassContext(UserEntity);
}

async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.REDIS,
    options: {
      url: REDIS_URL(),
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

  ebus._subscribe(
    new Subscriber<any>(e => {
      elogger.log(
        `${inspect(e)}`,
        // e.__proto__.constructor.name,
      );
    }),
  );


  cbus._subscribe(
    new Subscriber<any>(e => {
      clogger.log(`${inspect(e)}, ${e.__proto__.constructor.name}`);
    }),
  );

  qbus._subscribe(
    new Subscriber<any>(e => {
      qlogger.log(e.__proto__.constructor.name);
    }),
  );

  await app.listenAsync();

  const publisher = app.get(EventPublisher);
  prepareModels(publisher);
}
bootstrap();
