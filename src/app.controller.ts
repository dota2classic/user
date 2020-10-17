import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { GetByConnectionQueryResult } from './gateway/queries/GetByConnection/get-by-connection-query.result';
import { GetByConnectionQuery } from './gateway/queries/GetByConnection/get-by-connection.query';
import { construct } from './gateway/util/construct';
import { QueryBus } from '@nestjs/cqrs';

@Controller()
export class AppController {
  constructor(private readonly qbus: QueryBus) {}

  @MessagePattern(GetByConnectionQuery.name)
  async GetByConnectionQuery(
    query: GetByConnectionQuery,
  ): Promise<GetByConnectionQueryResult> {
    return this.qbus.execute(construct(GetByConnectionQuery, query));
  }
}
