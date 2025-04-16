import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { UserEntity } from 'src/user/model/user.entity';
import { create } from 'apisauce';
import { steam32to64, steam64to32 } from 'src/user/util/steamIds';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventBus } from '@nestjs/cqrs';
import { UserUpdatedInnerEvent } from 'src/user/event/user-updated-inner.event';
import { ConfigService } from '@nestjs/config';
import * as console from 'console';
import { UserProfileFastService } from '@dota2classic/caches/dist/service/user-profile-fast.service';
import { UserFastProfileDto } from 'src/gateway/caches/user-fast-profile.dto';

const steamapi = create({
  baseURL: 'http://api.steampowered.com',
});

interface TranslatedSteamId {
  steamid: string;
  username: string;
}

interface SteamProfile {
  steamid: string;
  personaname: string;
  avatarfull: string;
}

@Injectable()
export class UserService implements OnApplicationBootstrap {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userEntityRepository: Repository<UserEntity>,
    private readonly ebus: EventBus,
    private schedulerRegistry: SchedulerRegistry,
    private readonly config: ConfigService,
    private readonly user: UserProfileFastService<UserFastProfileDto>,
  ) {
    this.handleCron();
    console.log(this.schedulerRegistry.getCronJobs());
  }

  @Cron(CronExpression.EVERY_10_MINUTES, {
    name: 'username resolve',
  })
  async handleCron() {
    if (this.config.get('scalet')) return;
    this.logger.log(`Starting resolving names`);
    await this.usernameResolverTask();
    this.logger.log(`Resolved names`);
  }

  public async usernameResolverTask() {
    // Use empty first
    // const players = (await this.userEntityRepository.find()).sort((a,b) => {
    //   return (a.name.length === 0 ? -100000 : 0) - (b.name.length === 0 ? -100000 : 0)
    // } );

    const chunkSize = 100;

    const players = await this.userEntityRepository
      .createQueryBuilder('ue')
      .orderBy('updated_at', 'ASC', 'NULLS FIRST')
      .take(chunkSize)
      .getMany();

    try {
      const profiles = await this.getUsernames(players);

      // Intersection

      profiles.forEach((prof) => {
        const steam_32 = steam64to32(prof.steamid);
        const player = players.find((t) => t.steam_id === steam_32);
        if (player) {
          player.name = prof.personaname;
          player.avatar = prof.avatarfull;
          player.updated_at = new Date();
        }
      });
      await this.userEntityRepository.save(players);

      this.ebus.publishAll(
        players.map((it) => new UserUpdatedInnerEvent(it.steam_id)),
      );

      this.logger.log(`Updated ${players.length} profiles`);
    } catch (e) {
      this.logger.error('Rate limit hit, skipping cron task...');
    }
  }

  private async getUsernames(players: UserEntity[]): Promise<SteamProfile[]> {
    const steamIds = players.map((t) => steam32to64(t.steam_id)).join(',');

    const res = await steamapi.get<any>(
      '/ISteamUser/GetPlayerSummaries/v0002',
      {
        key: this.config.get('steamKey'),
        steamids: steamIds,
      },
    );
    return res.data!!.response.players;
  }

  async onApplicationBootstrap() {
    if (this.config.get('scalet')) return;
    // Populate cache
    const chunkSize = 100;
    const total = await this.userEntityRepository.count();
    for (let i = 0; i < Math.max(total / chunkSize); i++) {
      const batch = await this.userEntityRepository.find({
        order: {
          steam_id: 'ASC',
        },
        skip: i * chunkSize,
        take: chunkSize,
      });

      const users: UserFastProfileDto[] = batch.map(
        (b) =>
          ({
            steamId: b.steam_id,
            avatar: b.avatar,
            name: b.name,
            roles: b.activeRoles,
          }) satisfies UserFastProfileDto,
      );

      await Promise.all(users.map((t) => this.user.set(t)));
      this.logger.log(`Batch ${i} loaded to cache`);
    }
  }
}
