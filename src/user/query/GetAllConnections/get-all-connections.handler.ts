import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { GetAllConnectionsQuery } from 'src/gateway/queries/GetAllConnections/get-all-connections.query';
import {
  ConnectionEntry,
  GetAllConnectionsQueryResult,
} from 'src/gateway/queries/GetAllConnections/get-all-connections-query.result';
import { UserConnectionEntity } from 'src/user/model/user-connection.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlayerId } from 'src/gateway/shared-types/player-id';

@QueryHandler(GetAllConnectionsQuery)
export class GetAllConnectionsHandler
  implements
    IQueryHandler<GetAllConnectionsQuery, GetAllConnectionsQueryResult>
{
  private readonly logger = new Logger(GetAllConnectionsHandler.name);

  constructor(
    @InjectRepository(UserConnectionEntity)
    private readonly userConnectionEntityRepository: Repository<UserConnectionEntity>,
  ) {}

  async execute(
    command: GetAllConnectionsQuery,
  ): Promise<GetAllConnectionsQueryResult> {
    const allEntries = await this.userConnectionEntityRepository.find({
      where: {
        connection: command.connection,
      },
    });
    return new GetAllConnectionsQueryResult(
      allEntries.map(
        (t) =>
          new ConnectionEntry(
            new PlayerId(t.steamId),
            t.connection,
            t.externalId,
          ),
      ),
    );
  }
}
