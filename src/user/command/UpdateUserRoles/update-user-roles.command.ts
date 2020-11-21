import { PlayerId } from 'src/gateway/shared-types/player-id';
import { Role } from 'src/gateway/shared-types/roles';

export class UpdateUserRolesCommand {
  constructor(
    public readonly id: PlayerId,
    public readonly role: Role,
    public readonly end_time: number,
  ) {}
}
