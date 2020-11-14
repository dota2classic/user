import { Column, Entity, PrimaryColumn } from 'typeorm';
import { Role } from 'src/gateway/shared-types/roles';

@Entity()
export class UserEntity {
  @PrimaryColumn()
  steam_id: string;

  @Column({ default: '' })
  name: string;

  @Column({ nullable: true })
  avatar: string;

  @Column('varchar', { default: `${Role.PLAYER}` })
  private roles: string = '';

  public get userRoles(): Role[] {
    return this.roles.split(',') as Role[];
  }

  public set userRoles(r: Role[]) {
    this.roles = this.userRoles
      .concat(r)
      .filter((value, index, self) => self.indexOf(value) === index)
      .join(',');
  }
}
