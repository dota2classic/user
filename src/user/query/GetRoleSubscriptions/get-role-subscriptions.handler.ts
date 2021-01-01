import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { GetRoleSubscriptionsQuery } from 'src/gateway/queries/user/GetRoleSubscriptions/get-role-subscriptions.query';
import {
  GetRoleSubscriptionsQueryResult,
  UserRoleSummary,
} from 'src/gateway/queries/user/GetRoleSubscriptions/get-role-subscriptions-query.result';
import { UserRoleLifetimeEntity } from 'src/user/model/user-role-lifetime.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PlayerId } from 'src/gateway/shared-types/player-id';
import { UserEntity } from 'src/user/model/user.entity';

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
    @InjectRepository(UserEntity)
    private readonly userEntityRepository: Repository<UserEntity>,
  ) {}

  async execute(
    command: GetRoleSubscriptionsQuery,
  ): Promise<GetRoleSubscriptionsQueryResult> {
    let entries: UserRoleLifetimeEntity[] = [];
    if (command.id)
      entries = await this.userRoleLifetimeEntityRepository.find({
        steam_id: command.id.value,
      });
    else entries = await this.userRoleLifetimeEntityRepository.find();

    const grouped: {
      [key: string]: UserRoleSummary;
    } = {};

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];

      let group = grouped[entry.steam_id];
      if (!group) {
        grouped[entry.steam_id] = new UserRoleSummary(entry.steam_id, []);
        group = grouped[entry.steam_id];
      }

      group.entries.push(this.mapEntry(entry));
    }

    return new GetRoleSubscriptionsQueryResult(Object.values(grouped));
  }

  private mapEntry = (item: UserRoleLifetimeEntity) => ({
    role: item.role,
    end_time: item.end_time.getTime(),
    playerId: new PlayerId(item.steam_id),
  });
}
