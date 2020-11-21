import { Role } from 'src/gateway/shared-types/roles';

export class RoleLifetimeUpdatedEvent {
  constructor(public readonly steam_id: string, public readonly role: Role) {}
}
