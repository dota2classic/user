import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RedisOptions } from '@nestjs/microservices';
import { getRedisTransportOptions } from 'src/config/redis.config';
import { CommandBus, EventBus, EventPublisher, QueryBus } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { UserEntity } from 'src/user/model/user.entity';
import { inspect } from 'util';
import configuration from 'src/config/configuration';
import { ConfigService } from '@nestjs/config';

export function prepareModels(publisher: EventPublisher) {
  //
  publisher.mergeClassContext(UserEntity);
}

async function bootstrap() {
  const config = new ConfigService(configuration());

  const app = await NestFactory.create(AppModule);

  app.connectMicroservice<RedisOptions>(getRedisTransportOptions(config));

  const ebus = app.get(EventBus);
  const cbus = app.get(CommandBus);
  const qbus = app.get(QueryBus);

  const clogger = new Logger('CommandLogger');
  const elogger = new Logger('EventLogger');
  const qlogger = new Logger('QueryLogger');

  ebus.subscribe((e) => {
    elogger.log(
      // `${inspect(e)}`,
      e.constructor.name,
    );
  });

  cbus.subscribe((e) => {
    clogger.log(`${inspect(e)}, ${e.constructor.name}`);
  });

  qbus.subscribe((e) => {
    qlogger.log(e.constructor.name);
  });

  await app.startAllMicroservices();
  await app.init();

  clogger.log(
    `Starter user service as ${config.get('scalet') ? 'Scale node' : 'Ma;in node'}`,
  );

  const publisher = app.get(EventPublisher);
  prepareModels(publisher);
}
bootstrap();
