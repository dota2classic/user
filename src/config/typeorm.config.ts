import {DB_HOST, DB_PASSWORD, DB_USERNAME} from "./env";
import { UserEntity } from '../user/model/user.entity';
import { UserConnectionEntity } from '../user/model/user-connection.entity';
import { UserRoleLifetimeEntity } from 'src/user/model/user-role-lifetime.entity';

export const Entities = [
  UserEntity,
  UserConnectionEntity,
  UserRoleLifetimeEntity
]

export const devDbConfig: any = {
  type: 'postgres',
  database: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'docker',
  entities: Entities,
  synchronize: true,


  keepConnectionAlive: true,
};

export const prodDbConfig: any = {
  type: 'postgres',
  database: 'postgres',
  host: DB_HOST(),
  port: 5432,
  username: DB_USERNAME(),
  password: DB_PASSWORD(),
  entities: Entities,
  synchronize: true,
  ssl: false,
};
