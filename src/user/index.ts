import { GetByConnectionHandler } from './query/GetByConnection/get-by-connection.handler';
import { AttachUserConnectionHandler } from './command/AttachUserConnection/attach-user-connection.handler';

const Sagas = [];
const EventHandlers = [];
const Repositories = [];
const QueryHandlers = [GetByConnectionHandler];
const CommandHandlers = [AttachUserConnectionHandler];
export const UserProviders = [
  ...CommandHandlers,
  ...Sagas,
  ...EventHandlers,
  ...Repositories,
  ...QueryHandlers,
];
