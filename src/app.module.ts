import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { devDbConfig, Entities, prodDbConfig } from './config/typeorm.config';
import { isDev, REDIS_HOST, REDIS_PASSWORD, REDIS_URL } from './config/env';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { UserProviders } from './user';
import { ScheduleModule } from '@nestjs/schedule';
import { AppService } from 'src/app.service';

@Module({
  imports: [
    // SentryModule.forRoot({
    //   dsn:
    //     "https://3c960c25469d4a7fa6cdefde695d4cae@o435989.ingest.sentry.io/5529899",
    //   debug: false,
    //   environment: isDev ? "dev" : "production",
    //   logLevel: 2, //based on sentry.io loglevel //
    // }),
    CqrsModule,
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot(
      (isDev ? devDbConfig : prodDbConfig) as TypeOrmModuleOptions,
    ),
    TypeOrmModule.forFeature(Entities),
    ClientsModule.register([
      {
        name: 'QueryCore',
        transport: Transport.REDIS,
        options: {
          url: REDIS_URL(),
          host: REDIS_HOST(),
          retryAttempts: Infinity,
          retryDelay: 5000,
          password: REDIS_PASSWORD(),
        },
      },
    ] as any),
  ],
  controllers: [AppController],
  providers: [
    ...UserProviders,
    AppService
  ],
})
export class AppModule {}
