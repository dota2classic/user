import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/model/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MigrationManager {

  constructor(
    @InjectRepository(UserEntity)
    private readonly userEntityRepository: Repository<UserEntity>,
  ) {
    this.migrate();
  }


  async migrate() {
    let users = await this.userEntityRepository.find({});
    users.forEach(it => {
      if (it.steam_id.startsWith('[U')) {
        it.steam_id = it.steam_id.slice(5, it.steam_id.length - 1);
      }
    });

    const saved = await this.userEntityRepository.save(users);
    console.log(`Updated ${saved.length} users`);
  }

}
