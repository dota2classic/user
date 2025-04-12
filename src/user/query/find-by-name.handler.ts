import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { FindByNameQuery } from 'src/gateway/queries/FindByName/find-by-name.query';
import { FindByNameQueryResult } from 'src/gateway/queries/FindByName/find-by-name-query.result';
import { UserEntity } from 'src/user/model/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';

@QueryHandler(FindByNameQuery)
export class FindByNameHandler
  implements IQueryHandler<FindByNameQuery, FindByNameQueryResult>
{
  private readonly logger = new Logger(FindByNameHandler.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userEntityRepository: Repository<UserEntity>,
  ) {}

  async execute(command: FindByNameQuery): Promise<FindByNameQueryResult> {
    const ids = await this.userEntityRepository
      .find({
        where: {
          name: Like(`%${command.query}%`),
        },
        take: command.limit,
      })
      .then((it) => it.map((u) => u.steam_id));

    return new FindByNameQueryResult(ids);
  }
}
