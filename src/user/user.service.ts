import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UserEntity } from 'src/user/model/user.entity';
import { create } from 'apisauce';
import { steam32to64, steam64to32 } from 'src/user/util/steamIds';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventBus } from '@nestjs/cqrs';
import { UserUpdatedEvent } from 'src/gateway/events/user/user-updated.event';
import { UserEntry } from 'src/gateway/queries/GetAll/get-all-query.result';
import { PlayerId } from 'src/gateway/shared-types/player-id';

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
  ) {
    // this.handleCron();
  }

  @Cron(CronExpression.EVERY_HOUR)
  async handleCron() {
    this.logger.log(`Starting resolving names`);
    await this.usernameResolverTask();
    this.logger.log(`Resolved names`);
  }

  private async getUsernames(players: UserEntity[]): Promise<SteamProfile[]> {
    const steamIds = players.map(t => steam32to64(t.steam_id)).join(',');

    const res = await steamapi.get<any>(
      '/ISteamUser/GetPlayerSummaries/v0002',
      {
        key: '5944065088CFEF1A24F74BE1C4C1E7AE',
        steamids: steamIds,
      },
    );

    return res.data!!.response.players;
  }

  public async usernameResolverTask() {
    const players = await this.userEntityRepository.find();

    for (let i = 0; i < players.length / 100; i++) {
      const profiles = await this.getUsernames(
        players.slice(i * 100, (i + 1) * 100),
      );

      profiles.forEach(prof => {
        const steam_32 = steam64to32(prof.steamid);
        const player = players.find(t => t.steam_id === steam_32);
        if (player) {
          player.name = prof.personaname;
          player.avatar = prof.avatarfull;

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
    }

    await this.userEntityRepository.save(players);
  }
}
