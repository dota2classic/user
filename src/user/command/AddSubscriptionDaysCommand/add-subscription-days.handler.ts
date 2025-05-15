import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { AddSubscriptionDaysCommand } from 'src/user/command/AddSubscriptionDaysCommand/add-subscription-days.command';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/model/user.entity';
import { DataSource, Repository } from 'typeorm';
import { UserRoleLifetimeEntity } from 'src/user/model/user-role-lifetime.entity';
import { RoleLifetimeUpdatedEvent } from 'src/user/event/role-lifetime-updated.event';
import { Role } from 'src/gateway/shared-types/roles';

@CommandHandler(AddSubscriptionDaysCommand)
export class AddSubscriptionDaysHandler
  implements ICommandHandler<AddSubscriptionDaysCommand>
{
  private readonly logger = new Logger(AddSubscriptionDaysHandler.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userEntityRepository: Repository<UserEntity>,
    @InjectRepository(UserRoleLifetimeEntity)
    private readonly userRoleLifetimeEntityRepository: Repository<UserRoleLifetimeEntity>,
    private readonly ebus: EventBus,
    private readonly ds: DataSource,
  ) {}

  async execute(command: AddSubscriptionDaysCommand) {
    this.logger.log('Adding subscription days to', {
      steamId: command.steamId,
      days: command.days,
    });
    // MAke sure user exists
    let user = await this.userEntityRepository.findOne({
      where: { steam_id: command.steamId },
    });

    if (!user) {
      this.logger.warn("User didn't exist, had to create new");
      user = new UserEntity();
      user.steam_id = command.steamId;
      user = await this.userEntityRepository.save(user);
    }

    await this.ds.transaction(async (tx) => {
      let role = await tx
        .createQueryBuilder<UserRoleLifetimeEntity>(
          UserRoleLifetimeEntity,
          'role',
        )
        .setLock('pessimistic_write')
        .where('role.steam_id = :steamId', { steamId: command.steamId })
        .getOne();

      if (!role) {
        this.logger.warn("Role didn't exist, had to create new");
        role = new UserRoleLifetimeEntity();
        role.steam_id = command.steamId;
        role.role = Role.OLD;
        role.end_time = new Date(0);
        role = await tx.save(role);
      }

      await tx.query(
        `
UPDATE user_role_lifetime_entity
SET end_time = CASE
                   WHEN end_time < now() THEN now() + $3::interval
                   ELSE end_time + $3::interval
               END
WHERE steam_id = $1
  AND ROLE = $2;
        `,
        [command.steamId, Role.OLD, `${command.days} days`],
      );
      this.logger.log('Added role lifetime');
    });

    this.logger.log('Role days successfully extended');

    this.ebus.publish(new RoleLifetimeUpdatedEvent(command.steamId, Role.OLD));

    return true;
  }
}
