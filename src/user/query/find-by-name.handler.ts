import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { FindByNameQuery } from 'src/gateway/queries/FindByName/find-by-name.query';
import { FindByNameQueryResult } from 'src/gateway/queries/FindByName/find-by-name-query.result';
import { UserEntity } from 'src/user/model/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

@QueryHandler(FindByNameQuery)
export class FindByNameHandler
  implements IQueryHandler<FindByNameQuery, FindByNameQueryResult>
{
  private readonly logger = new Logger(FindByNameHandler.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userEntityRepository: Repository<UserEntity>,
    private readonly ds: DataSource,
  ) {}

  async execute(command: FindByNameQuery): Promise<FindByNameQueryResult> {
    const parametrizedLike = `%${command.query.replace(/%/g, '')}%`;
    const a = await this.ds.query<{ steam_id: string }[]>(
      `
select
    ue.steam_id,
    case when ue.steam_id in ($2) then 10000 else 1 end as score
from
    user_entity ue
where
    ue.name ilike $1
order by 2 desc
limit $3
    `,
      [parametrizedLike, command.prefer, command.limit],
    );

    return new FindByNameQueryResult(a.map((t) => t.steam_id));
  }
}
