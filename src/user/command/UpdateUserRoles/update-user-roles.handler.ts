import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { UpdateUserRolesCommand } from 'src/user/command/UpdateUserRoles/update-user-roles.command';
import { UserEntity } from 'src/user/model/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@CommandHandler(UpdateUserRolesCommand)
export class UpdateUserRolesHandler
  implements ICommandHandler<UpdateUserRolesCommand> {
  private readonly logger = new Logger(UpdateUserRolesHandler.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userEntityRepository: Repository<UserEntity>,
  ) {}

  async execute(command: UpdateUserRolesCommand) {
    const u = await this.userEntityRepository.findOne({
      steam_id: command.id.value,
    });

    if (u) {
      u.userRoles = command.roles;
      u.updated();
      u.commit();

      await this.userEntityRepository.save(u);
    }
  }
}
