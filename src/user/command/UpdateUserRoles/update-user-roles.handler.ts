import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { UpdateUserRolesCommand } from 'src/user/command/UpdateUserRoles/update-user-roles.command';
import { UserEntity } from 'src/user/model/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRoleLifetimeEntity } from 'src/user/model/user-role-lifetime.entity';
import { RoleLifetimeUpdatedEvent } from 'src/user/event/role-lifetime-updated.event';

@CommandHandler(UpdateUserRolesCommand)
export class UpdateUserRolesHandler
  implements ICommandHandler<UpdateUserRolesCommand> {
  private readonly logger = new Logger(UpdateUserRolesHandler.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userEntityRepository: Repository<UserEntity>,
    @InjectRepository(UserRoleLifetimeEntity)
    private readonly userRoleLifetimeEntityRepository: Repository<
      UserRoleLifetimeEntity
    >,
    private readonly ebus: EventBus,
  ) {}

  async execute(command: UpdateUserRolesCommand) {
    let r = await this.userRoleLifetimeEntityRepository.findOne({
      steam_id: command.id.value,
      role: command.role,
    });

    if (!r) {
      r = new UserRoleLifetimeEntity();
      r.steam_id = command.id.value;
      r.role = command.role;
      r.end_time = new Date(command.end_time);
      await this.userRoleLifetimeEntityRepository.save(r);
      this.ebus.publish(
        new RoleLifetimeUpdatedEvent(command.id.value, command.role),
      );
      return;
    }

    r.end_time = new Date(command.end_time);
    await this.userRoleLifetimeEntityRepository.save(r);

    this.ebus.publish(
      new RoleLifetimeUpdatedEvent(command.id.value, command.role),
    );
  }
}
