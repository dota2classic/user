import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UserRoleLifetimeEntity } from 'src/user/model/user-role-lifetime.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from 'src/user/model/user.entity';
import { EventBus } from '@nestjs/cqrs';
import { UserUpdatedEvent } from 'src/gateway/events/user/user-updated.event';
import { UserRoleTimingsUpdateEvent } from 'src/gateway/events/user/user-role-timings-update.event';
import { IS_SCALE_NODE } from 'src/config/env';

@Injectable()
export class RoleService {
  private readonly logger = new Logger(RoleService.name);

  constructor(
    @InjectRepository(UserRoleLifetimeEntity)
    private readonly rlRep: Repository<UserRoleLifetimeEntity>,
    @InjectRepository(UserEntity)
    private readonly userEntityRepository: Repository<UserEntity>,
    private readonly ebus: EventBus,
  ) {
    this.checkRoles();
  }

  @Cron(CronExpression.EVERY_HOUR, {
    name: 'Check roles'
  })
  async checkRoles() {
    if(IS_SCALE_NODE) return;
    this.logger.log(`Starting checking roles`);
    const lifetimes = await this.rlRep.find();
    for (let i = 0; i < lifetimes.length; i++) {
      const lifetime = lifetimes[i];
      await this.check(lifetime);
    }
    this.logger.log(`Finished checking roles`);
  }

  public async check(lifetime: UserRoleLifetimeEntity) {
    let u = await this.userEntityRepository.findOne({
      where: { steam_id: lifetime.steam_id,}
    });

    if (!u) {
      u = new UserEntity();
      u.steam_id = lifetime.steam_id;
      u.created_at = new Date();
      await this.userEntityRepository.save(u);
    }

    if (lifetime.isExpired) {
      console.log('expired role ', lifetime.role)
      // if lifetime is expired, we need to remove role and delete lifetime
      u.userRoles = [...u.userRoles].filter(t => t !== lifetime.role);

      await this.userEntityRepository.save(u);

      this.ebus.publish(new UserUpdatedEvent(u.asEntry()));
      this.ebus.publish(new UserRoleTimingsUpdateEvent(u.asEntry()));

      // await this.rlRep.delete(lifetime.id);
      this.logger.log(`Removed timed out role`);
    } else {
      // if its active, we make sure user has role
      const indx = u.userRoles.findIndex(t => t === lifetime.role);
      if (indx === -1) {
        u.userRoles = u.userRoles.concat([lifetime.role]);
        await this.userEntityRepository.save(u);
        this.ebus.publish(new UserUpdatedEvent(u.asEntry()));
        this.ebus.publish(new UserRoleTimingsUpdateEvent(u.asEntry()));
      }
    }
  }
}
