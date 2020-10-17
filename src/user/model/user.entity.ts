import { Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class UserEntity {

  @PrimaryColumn()
  steam_id: string;
}