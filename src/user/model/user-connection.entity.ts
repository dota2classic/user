import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { UserEntity } from './user.entity';



@Entity()
export class UserConnectionEntity {
  @PrimaryColumn()
  steam_id: string;

  @ManyToOne(t => UserEntity)
  @JoinColumn({
    name: 'steam_id',
  })
  user!: UserEntity;


  @Column()
  external_id: string;
}

