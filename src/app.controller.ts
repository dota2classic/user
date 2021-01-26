import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern } from '@nestjs/microservices';
import { GetByConnectionQueryResult } from './gateway/queries/GetByConnection/get-by-connection-query.result';
import { GetByConnectionQuery } from './gateway/queries/GetByConnection/get-by-connection.query';
import { construct } from './gateway/util/construct';
import { CommandBus, EventBus, QueryBus } from '@nestjs/cqrs';
import { GetAllConnectionsQuery } from 'src/gateway/queries/GetAllConnections/get-all-connections.query';
import { GetAllConnectionsQueryResult } from 'src/gateway/queries/GetAllConnections/get-all-connections-query.result';
import { GetAllQuery } from './gateway/queries/GetAll/get-all.query';
import { GetAllQueryResult } from 'src/gateway/queries/GetAll/get-all-query.result';
import { GetUserInfoQueryResult } from 'src/gateway/queries/GetUserInfo/get-user-info-query.result';
import { GetUserInfoQuery } from './gateway/queries/GetUserInfo/get-user-info.query';
import { UserRolesUpdatedEvent } from 'src/gateway/events/user/user-roles-updated.event';
import { AttachUserConnectionCommand } from './gateway/commands/attach-user-connection.command';
import { GetConnectionsQuery } from './gateway/queries/GetConnections/get-connections.query';
import { GetConnectionsQueryResult } from 'src/gateway/queries/GetConnections/get-connections-query.result';
import { UserMightExistEvent } from 'src/gateway/events/user/user-might-exist.event';
import { GetRoleSubscriptionsQuery } from 'src/gateway/queries/user/GetRoleSubscriptions/get-role-subscriptions.query';
import { GetRoleSubscriptionsQueryResult } from 'src/gateway/queries/user/GetRoleSubscriptions/get-role-subscriptions-query.result';
import { UserLoggedInEvent } from './gateway/events/user/user-logged-in.event';

@Controller()
export class AppController {
  constructor(
    private readonly qbus: QueryBus,
    private readonly cbus: CommandBus,
    private readonly ebus: EventBus,
  ) {}

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

  @MessagePattern(GetAllQuery.name)
  async GetAllQuery(query: GetAllQuery): Promise<GetAllQueryResult> {
    return this.qbus.execute(construct(GetAllQuery, query));
  }

  @MessagePattern(GetUserInfoQuery.name)
  async GetUserInfoQuery(
    query: GetUserInfoQuery,
  ): Promise<GetUserInfoQueryResult> {
    return this.qbus.execute(construct(GetUserInfoQuery, query));
  }

  @MessagePattern(GetRoleSubscriptionsQuery.name)
  async GetRoleSubscriptionsQuery(
    query: GetRoleSubscriptionsQuery,
  ): Promise<GetRoleSubscriptionsQueryResult> {
    return this.qbus.execute(construct(GetRoleSubscriptionsQuery, query));
  }

  @MessagePattern(GetConnectionsQuery.name)
  async GetConnectionsQuery(
    query: GetConnectionsQuery,
  ): Promise<GetConnectionsQueryResult> {
    return this.qbus.execute(construct(GetConnectionsQuery, query));
  }

  @MessagePattern(AttachUserConnectionCommand.name)
  async AttachUserConnectionCommand(
    query: AttachUserConnectionCommand,
  ): Promise<GetUserInfoQueryResult> {
    return this.cbus.execute(construct(AttachUserConnectionCommand, query));
  }

  @EventPattern(UserRolesUpdatedEvent.name)
  async UserRolesUpdatedEvent(query: UserRolesUpdatedEvent) {
    return this.ebus.publish(construct(UserRolesUpdatedEvent, query));
  }

  @EventPattern(UserMightExistEvent.name)
  async UserMightExistEvent(query: UserMightExistEvent) {
    return this.ebus.publish(construct(UserMightExistEvent, query));
  }

  @EventPattern(UserLoggedInEvent.name)
  async UserLoggedInEvent(query: UserLoggedInEvent) {
    return this.ebus.publish(construct(UserLoggedInEvent, query));
  }
}
