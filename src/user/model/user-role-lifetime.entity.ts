import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Role } from 'src/gateway/shared-types/roles';

@Entity()
export class UserRoleLifetimeEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  steam_id: string;

  @CreateDateColumn()
  created_at: Date;

  @Column()
  end_time: Date;

  @Column()
  role!: Role;




  public get isExpired(): boolean{
    return new Date().getTime() > this.end_time.getTime()
  }
}
