import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { GetByConnectionQuery } from '../../../gateway/queries/GetByConnection/get-by-connection.query';
import { GetByConnectionQueryResult } from '../../../gateway/queries/GetByConnection/get-by-connection-query.result';
import { UserConnectionEntity } from '../../model/user-connection.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlayerId } from '../../../gateway/shared-types/player-id';

@QueryHandler(GetByConnectionQuery)
export class GetByConnectionHandler
  implements IQueryHandler<GetByConnectionQuery, GetByConnectionQueryResult> {
  private readonly logger = new Logger(GetByConnectionHandler.name);

  constructor(
    @InjectRepository(UserConnectionEntity)
    private readonly userConnectionEntityRepository: Repository<
      UserConnectionEntity
    >,
  ) {}

  async execute(
    command: GetByConnectionQuery,
  ): Promise<GetByConnectionQueryResult> {
    const con = await this.userConnectionEntityRepository.findOne({
      where :{
        connection: command.connection,
        external_id: command.externalId
      }
    });

    if (con) return new GetByConnectionQueryResult(new PlayerId(con.steam_id));

    return new GetByConnectionQueryResult(null);
  }
}
