import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { GetAllQuery } from 'src/gateway/queries/GetAll/get-all.query';
import {
  GetAllQueryResult,
  UserEntry,
} from 'src/gateway/queries/GetAll/get-all-query.result';
import { UserEntity } from 'src/user/model/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlayerId } from 'src/gateway/shared-types/player-id';

@QueryHandler(GetAllQuery)
export class GetAllHandler
  implements IQueryHandler<GetAllQuery, GetAllQueryResult> {
  private readonly logger = new Logger(GetAllHandler.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userEntityRepository: Repository<UserEntity>,
  ) {}

  async execute(command: GetAllQuery): Promise<GetAllQueryResult> {
    const all = await this.userEntityRepository.find();

    return new GetAllQueryResult(
      all.map(
        (t) =>
          new UserEntry(
            new PlayerId(t.steam_id),
            t.name,
            t.avatar,
            t.activeRoles,
          ),
      ),
    );
  }
}
