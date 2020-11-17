import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { GetConnectionsQuery } from 'src/gateway/queries/GetConnections/get-connections.query';
import { GetConnectionsQueryResult } from 'src/gateway/queries/GetConnections/get-connections-query.result';
import { UserConnectionEntity } from 'src/user/model/user-connection.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConnectionEntry } from 'src/gateway/queries/GetAllConnections/get-all-connections-query.result';

@QueryHandler(GetConnectionsQuery)
export class GetConnectionsHandler
  implements IQueryHandler<GetConnectionsQuery, GetConnectionsQueryResult> {
  private readonly logger = new Logger(GetConnectionsHandler.name);

  constructor(
    @InjectRepository(UserConnectionEntity)
    private readonly urep: Repository<UserConnectionEntity>,
  ) {}

  async execute(
    command: GetConnectionsQuery,
  ): Promise<GetConnectionsQueryResult> {
    const con = await this.urep.findOne({
      steam_id: command.playerId.value,
      connection: command.connection,
    });

    if(!con) return;

    return new GetConnectionsQueryResult(
      new ConnectionEntry(command.playerId, con.connection, con.external_id),
    );
  }
}
