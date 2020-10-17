import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HOST_PORT, REDIS_URL } from './config/env';
import { Transport } from '@nestjs/microservices';
import { CommandBus, EventBus, EventPublisher } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { Subscriber } from 'rxjs';

export function prepareModels(publisher: EventPublisher) {
  //
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice({
    transport: Transport.REDIS,
    options: {
      url: REDIS_URL(),
      retryAttempts: 10,
      retryDelay: 5000,
    },
  });

  const ebus = app.get(EventBus);
  const cbus = app.get(CommandBus);

  const clogger = new Logger('CommandLogger');
  const elogger = new Logger('EventLogger');

  ebus._subscribe(
    new Subscriber<any>(e => {
      elogger.log(
        // `${inspect(e)}`,
        e.__proto__.constructor.name,
      );
    }),
  );

  cbus._subscribe(
    new Subscriber<any>(e => {
      clogger.log(
        // `${inspect(e)}`,
        e.__proto__.constructor.name,
      );
    }),
  );

  await app.startAllMicroservicesAsync();
  await app.listen(HOST_PORT);

  const publisher = app.get(EventPublisher);
  prepareModels(publisher);
}
bootstrap();
