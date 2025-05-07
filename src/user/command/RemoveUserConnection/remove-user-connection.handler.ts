import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { RemoveUserConnectionCommand } from 'src/gateway/commands/remove-user-connection.command';
import { UserConnectionEntity } from 'src/user/model/user-connection.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserUpdatedInnerEvent } from 'src/user/event/user-updated-inner.event';

@CommandHandler(RemoveUserConnectionCommand)
export class RemoveUserConnectionHandler
  implements ICommandHandler<RemoveUserConnectionCommand>
{
  private readonly logger = new Logger(RemoveUserConnectionHandler.name);

  constructor(
    @InjectRepository(UserConnectionEntity)
    private readonly userConnectionEntityRepository: Repository<UserConnectionEntity>,
    private readonly ebus: EventBus,
  ) {}

  async execute(command: RemoveUserConnectionCommand) {
    const del = await this.userConnectionEntityRepository.delete({
      steamId: command.steamId,
      connection: command.connection,
    });

    if (del.affected) {
      await this.ebus.publish(new UserUpdatedInnerEvent(command.steamId));
    }
  }
}
