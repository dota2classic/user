import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import configuration from './configuration';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { Entities } from 'src/config/entities';

export const getTypeormConfig = (
  cs: ConfigService,
): PostgresConnectionOptions => {
  return {
    type: 'postgres',
    database: 'postgres',

    port: cs.get('postgres.port') || 5432,
    host: cs.get('postgres.host'),
    username: cs.get('postgres.username'),
    password: cs.get('postgres.password'),
    synchronize: false,
    entities: Entities,
    migrations: ['src/config/migrations/*.*'],
    migrationsRun: false,
    migrationsTableName: 'user_migrations',
    logging: true,
  };
};

const AppDataSource = new DataSource(
  getTypeormConfig(new ConfigService(configuration())),
);

export default AppDataSource;
