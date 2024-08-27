import { QueryHandler, IQueryHandler, EventBus } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { GetUserInfoQuery } from 'src/gateway/queries/GetUserInfo/get-user-info.query';
import { GetUserInfoQueryResult } from 'src/gateway/queries/GetUserInfo/get-user-info-query.result';
import { UserEntity } from 'src/user/model/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserMightExistEvent } from 'src/gateway/events/user/user-might-exist.event';
import { cached } from 'src/util/cached';

@QueryHandler(GetUserInfoQuery)
export class GetUserInfoHandler
  implements IQueryHandler<GetUserInfoQuery, GetUserInfoQueryResult> {
  private readonly logger = new Logger(GetUserInfoHandler.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userEntityRepository: Repository<UserEntity>,
    private readonly ebus: EventBus
  ) {}


  @cached(100, GetUserInfoQuery.name)
  async execute(command: GetUserInfoQuery): Promise<GetUserInfoQueryResult> {
    const res = await this.userEntityRepository.findOne({
      where: { steam_id: command.playerId.value, }
    });

    console.log('Before');
    this.ebus.publish(new UserMightExistEvent(command.playerId))
    console.log('AFter');
    return new GetUserInfoQueryResult(command.playerId, res?.name || "", res?.avatar || "", res?.userRoles || []);
  }
}
