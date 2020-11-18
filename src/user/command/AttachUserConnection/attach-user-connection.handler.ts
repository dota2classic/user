import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { AttachUserConnectionCommand } from 'src/gateway/commands/attach-user-connection.command';
import { UserConnectionEntity } from '../../model/user-connection.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../../model/user.entity';
import { UserConnectionCreatedEvent } from 'src/gateway/events/user/user-connection-created.event';
import { PlayerId } from 'src/gateway/shared-types/player-id';
import { UserConnectionDeletedEvent } from 'src/gateway/events/user/user-connection-deleted.event';

@CommandHandler(AttachUserConnectionCommand)
export class AttachUserConnectionHandler
  implements ICommandHandler<AttachUserConnectionCommand> {
  private readonly logger = new Logger(AttachUserConnectionHandler.name);

  constructor(
    @InjectRepository(UserConnectionEntity)
    private readonly userConnectionEntityRepository: Repository<
      UserConnectionEntity
    >,
    @InjectRepository(UserEntity)
    private readonly userEntityRepository: Repository<UserEntity>,
    private readonly ebus: EventBus,
  ) {}

  async execute(command: AttachUserConnectionCommand) {
    let u = await this.userEntityRepository.findOne({
      steam_id: command.playerId.value,
    });
    if (!u) {
      u = new UserEntity();
      u.steam_id = command.playerId.value;
      await this.userEntityRepository.save(u);
      u.created();
      u.commit();
    }

    const existingConnection = await this.userConnectionEntityRepository.findOne(
      {
        connection: command.connection,
        external_id: command.externalId,
      },
    );

    // if there is connection, we delete it(no duplicates)
    if (existingConnection) {
      await this.userConnectionEntityRepository.delete(existingConnection);
      this.ebus.publish(
        new UserConnectionDeletedEvent(
          new PlayerId(existingConnection.steam_id),
          existingConnection.connection,
          existingConnection.external_id,
        ),
      );
    }

    let con = await this.userConnectionEntityRepository.findOne({
      connection: command.connection,
      steam_id: command.playerId.value,
    });

    if (con) await this.userConnectionEntityRepository.delete(con);

    con = new UserConnectionEntity();
    con.steam_id = u.steam_id;
    con.connection = command.connection;
    con.external_id = command.externalId;
    await this.userConnectionEntityRepository.save(con);
    this.ebus.publish(
      new UserConnectionCreatedEvent(
        new PlayerId(con.steam_id),
        con.connection,
        con.external_id,
      ),
    );
  }
}
