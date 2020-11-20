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

const Sagas = [];
const EventHandlers = [
  UserMightExistHandler
];
const Repositories = [];
const QueryHandlers = [
  GetByConnectionHandler,
  GetAllConnectionsHandler,
  GetAllHandler,
  GetUserInfoHandler,
  GetConnectionsHandler
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
  RoleService
];
