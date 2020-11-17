import { GetByConnectionHandler } from './query/GetByConnection/get-by-connection.handler';
import { AttachUserConnectionHandler } from './command/AttachUserConnection/attach-user-connection.handler';
import { GetAllConnectionsHandler } from 'src/user/query/GetAllConnections/get-all-connections.handler';
import { GetAllHandler } from 'src/user/query/GetAll/get-all.handler';
import { GetUserInfoHandler } from 'src/user/query/GetUserInfo/get-user-info.handler';
import { UserService } from 'src/user/user.service';
import { UpdateUserRolesHandler } from 'src/user/command/UpdateUserRoles/update-user-roles.handler';
import { UserSaga } from 'src/user/saga/user.saga';
import { GetConnectionsHandler } from 'src/user/query/GetConnection/get-connection.handler';

const Sagas = [];
const EventHandlers = [];
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
];
