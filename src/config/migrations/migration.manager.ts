import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/model/user.entity';
import { Connection, Repository } from 'typeorm';

@Injectable()
export class MigrationManager {

  constructor(
    @InjectRepository(UserEntity)
    private readonly userEntityRepository: Repository<UserEntity>,
    private readonly connection: Connection,
  ) {
    // this.migrateUserIds();
    // this.migrateVersionPlayerIds()
    // this.migratePlayerInMatch()
    // this.tournamentParticipants()
    // this.migrateTeamInvitations()
    // this.migrateTeamMembers()
  }


  async migrateUserIds() {
    let users = await this.userEntityRepository.find({});
    users.forEach(it => {
      if (it.steam_id.startsWith('[U')) {
        it.steam_id = it.steam_id.slice(5, it.steam_id.length - 1);
      }
    });

    const saved = await this.userEntityRepository.save(users);
    console.log(`Updated ${saved.length} users`);
  }

  async migrateVersionPlayerIds() {
    const res: { steam_id: string }[] = await this.connection.manager.query(`select steam_id from version_player`);
    for (const it of res) {
      if (!it.steam_id.startsWith('[U:')) continue;
      const numerical = parseInt(it.steam_id.slice(5, it.steam_id.length - 1));
      if (Number.isNaN(numerical)) {
        console.error(`Couldn't parse steam_id ${it.steam_id}`);
        continue;
      }

      await this.connection.manager.query(`update version_player vp set steam_id = '${numerical}' where vp.steam_id = '${it.steam_id}';`);
    }
    console.log(`Migrated version player table`);
  }

  async migratePlayerInMatch() {
    const res: {
      playerId: string,
      id: number
    }[] = await this.connection.manager.query(`select id, "playerId" from player_in_match`);
    // console.log(res.slice(0, 2))
    for (const it of res) {
      console.log(it);
      if (!it.playerId.startsWith('[U:')) continue;
      const numerical = parseInt(it.playerId.slice(5, it.playerId.length - 1));
      if (Number.isNaN(numerical)) {
        console.error(`Couldn't parse steam_id ${it.playerId}`);
        continue;
      }

      await this.connection.manager.query(`update player_in_match p set "playerId" = '${numerical}' where p.id = ${it.id};`);
    }
    console.log(`Migrated player_in_match table`);
  }


  async tournamentParticipants() {
    const res: {
      name: string,
      id: number
    }[] = await this.connection.manager.query(`select id, name from tournament_participant_entity`);
    for (const it of res) {
      if (!it.name.startsWith('[U:')) continue;
      const numerical = parseInt(it.name.slice(5, it.name.length - 1));
      if (Number.isNaN(numerical)) {
        console.error(`Couldn't parse steam_id ${it.name}`);
        continue;
      }

      await this.connection.manager.query(`update tournament_participant_entity tpe set name = '${numerical}' where tpe.id = ${it.id};`);
    }

    console.log('Migrated tournament participants');
  }

  async migrateTeamInvitations() {
    const res: {
      steam_id: string,
      id: number
    }[] = await this.connection.manager.query(`select id, steam_id from team_invitation_entity`);
    for (const it of res) {
      if (!it.steam_id.startsWith('[U:')) continue;
      const numerical = parseInt(it.steam_id.slice(5, it.steam_id.length - 1));
      if (Number.isNaN(numerical)) {
        console.error(`Couldn't parse steam_id ${it.steam_id}`);
        continue;
      }

      await this.connection.manager.query(`update team_invitation_entity tie set steam_id = '${numerical}' where tie.id = ${it.id};`);
    }

    console.log('Migrated team invitations');
  }

  async migrateTeamMembers() {
    const res: {
      steam_id: string,
      id: number
    }[] = await this.connection.manager.query(`select id, steam_id from team_member_entity`);
    for (const it of res) {
      if (!it.steam_id.startsWith('[U:')) continue;
      const numerical = parseInt(it.steam_id.slice(5, it.steam_id.length - 1));
      if (Number.isNaN(numerical)) {
        console.error(`Couldn't parse steam_id ${it.steam_id}`);
        continue;
      }

      await this.connection.manager.query(`update team_member_entity tme set steam_id = '${numerical}' where tme.id = ${it.id};`);
    }

    console.log('Migrated team invitations');
  }
}
