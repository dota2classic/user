import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { getTypeormConfig } from './config/typeorm.config';
import { ClientsModule, RedisOptions, Transport } from '@nestjs/microservices';
import { UserProviders } from './user';
import { ScheduleModule } from '@nestjs/schedule';
import { AppService } from 'src/app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from 'src/config/configuration';
import { Entities } from 'src/config/entities';
import { UserProfileModule } from '@dota2classic/caches';

@Module({
  imports: [
    // SentryModule.forRoot({
    //   dsn:
    //     "https://3c960c25469d4a7fa6cdefde695d4cae@o435989.ingest.sentry.io/5529899",
    //   debug: false,
    //   environment: isDev ? "dev" : "production",
    //   logLevel: 2, //based on sentry.io loglevel //
    // }),
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    UserProfileModule.registerAsync({
      imports: [],
      useFactory(config: ConfigService) {
        return {
          host: config.get('redis.host'),
          password: config.get('redis.password'),
          port: 6379,
        };
      },
      inject: [ConfigService],
    }),
    CqrsModule,
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      useFactory(config: ConfigService): TypeOrmModuleOptions {
        return {
          ...getTypeormConfig(config),
          type: 'postgres',
          migrations: ['dist/config/migrations/*.*'],
          migrationsRun: true,
          logging: undefined,
        };
      },
      imports: [],
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature(Entities),
    ClientsModule.registerAsync([
      {
        name: 'QueryCore',
        useFactory(config: ConfigService): RedisOptions {
          return {
            transport: Transport.REDIS,
            options: {
              host: config.get('redis.host'),
              password: config.get('redis.password'),
            },
          };
        },
        inject: [ConfigService],
        imports: [],
      },
    ]),
  ],
  controllers: [AppController],
  providers: [...UserProviders, AppService],
})
export class AppModule {}
