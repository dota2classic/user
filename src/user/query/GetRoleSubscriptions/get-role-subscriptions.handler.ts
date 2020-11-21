import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { GetRoleSubscriptionsQuery } from 'src/gateway/queries/user/GetRoleSubscriptions/get-role-subscriptions.query';
import { GetRoleSubscriptionsQueryResult } from 'src/gateway/queries/user/GetRoleSubscriptions/get-role-subscriptions-query.result';
import { UserRoleLifetimeEntity } from 'src/user/model/user-role-lifetime.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PlayerId } from 'src/gateway/shared-types/player-id';

@QueryHandler(GetRoleSubscriptionsQuery)
export class GetRoleSubscriptionsHandler
  implements
    IQueryHandler<GetRoleSubscriptionsQuery, GetRoleSubscriptionsQueryResult> {
  private readonly logger = new Logger(GetRoleSubscriptionsHandler.name);

  constructor(
    @InjectRepository(UserRoleLifetimeEntity)
    private readonly userRoleLifetimeEntityRepository: Repository<
      UserRoleLifetimeEntity
    >,
  ) {}

  async execute(
    command: GetRoleSubscriptionsQuery,
  ): Promise<GetRoleSubscriptionsQueryResult> {
    const entries = await this.userRoleLifetimeEntityRepository
      .find()
      .then(items =>
        items.map(item => ({
          role: item.role,
          end_time: item.end_time.getTime(),
          playerId: new PlayerId(item.steam_id),
        })),
      );

    return new GetRoleSubscriptionsQueryResult(entries);
  }
}
