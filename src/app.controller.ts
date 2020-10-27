import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { GetByConnectionQueryResult } from './gateway/queries/GetByConnection/get-by-connection-query.result';
import { GetByConnectionQuery } from './gateway/queries/GetByConnection/get-by-connection.query';
import { construct } from './gateway/util/construct';
import { QueryBus } from '@nestjs/cqrs';
import { GetAllConnectionsQuery } from 'src/gateway/queries/GetAllConnections/get-all-connections.query';
import { GetAllConnectionsQueryResult } from 'src/gateway/queries/GetAllConnections/get-all-connections-query.result';

@Controller()
export class AppController {
  constructor(private readonly qbus: QueryBus) {}

  @MessagePattern(GetByConnectionQuery.name)
  async GetByConnectionQuery(
    query: GetByConnectionQuery,
  ): Promise<GetByConnectionQueryResult> {
    return this.qbus.execute(construct(GetByConnectionQuery, query));
  }

  @MessagePattern(GetAllConnectionsQuery.name)
  async GetAllConnectionsQuery(
    query: GetAllConnectionsQuery,
  ): Promise<GetAllConnectionsQueryResult> {
    return this.qbus.execute(construct(GetAllConnectionsQuery, query));
  }
}
