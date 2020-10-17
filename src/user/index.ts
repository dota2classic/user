import { GetByConnectionHandler } from './query/GetByConnection/get-by-connection.handler';

const Sagas = [];
const EventHandlers = [];
const Repositories = [];
const QueryHandlers = [GetByConnectionHandler];
const CommandHandlers = [];
export const UserProviders = [
  ...CommandHandlers,
  ...Sagas,
  ...EventHandlers,
  ...Repositories,
  ...QueryHandlers,
];
