import { GetByConnectionHandler } from './query/GetByConnection/get-by-connection.handler';
import { AttachUserConnectionHandler } from './command/AttachUserConnection/attach-user-connection.handler';
import { GetAllConnectionsHandler } from 'src/user/query/GetAllConnections/get-all-connections.handler';
import { GetAllHandler } from 'src/user/query/GetAll/get-all.handler';
import { GetUserInfoHandler } from 'src/user/query/GetUserInfo/get-user-info.handler';
import { UserService } from 'src/user/service/user.service';
import { UpdateUserRolesHandler } from 'src/user/command/UpdateUserRoles/update-user-roles.handler';
import { UserSaga } from 'src/user/saga/user.saga';
import { GetConnectionsHandler } from 'src/user/query/GetConnection/get-connection.handler';
import { UserMightExistHandler } from 'src/user/event-handler/user-might-exist.handler';
import { RoleService } from 'src/user/service/role.service';
import { RoleLifetimeUpdatedHandler } from 'src/user/event-handler/role-lifetime-updated.handler';
import { GetRoleSubscriptionsHandler } from 'src/user/query/GetRoleSubscriptions/get-role-subscriptions.handler';
import { UserLoggedInHandler } from 'src/user/event-handler/user-logged-in.handler';
import { MigrationManager } from 'src/config/migrations/migration.manager';

const Sagas = [];
const EventHandlers = [
  UserMightExistHandler,
  RoleLifetimeUpdatedHandler,
  UserLoggedInHandler
];
const Repositories = [];
const QueryHandlers = [
  GetByConnectionHandler,
  GetAllConnectionsHandler,
  GetAllHandler,
  GetUserInfoHandler,
  GetConnectionsHandler,
  UpdateUserRolesHandler,
  GetRoleSubscriptionsHandler
];
const CommandHandlers = [AttachUserConnectionHandler, UpdateUserRolesHandler];
export const UserProviders = [
  ...CommandHandlers,
  ...Sagas,
  ...EventHandlers,
  ...Repositories,
  ...QueryHandlers,


  UserSaga,
  UserService,
  RoleService,
  MigrationManager,
];
