import { GetByConnectionHandler } from './query/GetByConnection/get-by-connection.handler';
import { AttachUserConnectionHandler } from './command/AttachUserConnection/attach-user-connection.handler';
import { GetAllConnectionsHandler } from 'src/user/query/GetAllConnections/get-all-connections.handler';
import { GetAllHandler } from 'src/user/query/GetAll/get-all.handler';

const Sagas = [];
const EventHandlers = [];
const Repositories = [];
const QueryHandlers = [
  GetByConnectionHandler,
  GetAllConnectionsHandler,
  GetAllHandler,
];
const CommandHandlers = [AttachUserConnectionHandler];
export const UserProviders = [
  ...CommandHandlers,
  ...Sagas,
  ...EventHandlers,
  ...Repositories,
  ...QueryHandlers,
];
