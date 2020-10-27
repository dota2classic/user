import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { devDbConfig, Entities, prodDbConfig } from './config/typeorm.config';
import { isDev, REDIS_URL } from './config/env';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { UserProviders } from './user';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
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
          retryAttempts: 10,
          retryDelay: 5000,
        },
      },
    ] as any),
  ],
  controllers: [AppController],
  providers: [
    ...UserProviders
  ],
})
export class AppModule {}