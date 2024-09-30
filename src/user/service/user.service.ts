import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { UserEntity } from 'src/user/model/user.entity';
import { create } from 'apisauce';
import { steam32to64, steam64to32 } from 'src/user/util/steamIds';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventBus } from '@nestjs/cqrs';
import { UserUpdatedEvent } from 'src/gateway/events/user/user-updated.event';
import { UserEntry } from 'src/gateway/queries/GetAll/get-all-query.result';
import { PlayerId } from 'src/gateway/shared-types/player-id';
import { IS_SCALE_NODE, STEAM_KEY } from 'src/config/env';

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
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userEntityRepository: Repository<UserEntity>,
    private readonly ebus: EventBus,
    private schedulerRegistry: SchedulerRegistry,
  ) {
    this.handleCron();
    console.log(this.schedulerRegistry.getCronJobs());
  }

  @Cron(CronExpression.EVERY_MINUTE, {
    name: 'username resolve',
  })
  async handleCron() {
    if (IS_SCALE_NODE) return;
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
          // console.log(player)

          this.ebus.publish(
            new UserUpdatedEvent(
              new UserEntry(
                new PlayerId(steam_32),
                player.name,
                player.avatar,
                player.userRoles,
              ),
            ),
          );
        }
      });
      await this.userEntityRepository.save(players);

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
        key: STEAM_KEY(),
        steamids: steamIds,
      },
    );

    return res.data!!.response.players;
  }
}
