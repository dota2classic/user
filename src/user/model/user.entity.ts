import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class UserEntity {

  @PrimaryColumn()
  steam_id: string;

  @Column({ default: ""})
  name: string
}