import { ICommand, ofType, Saga } from '@nestjs/cqrs';
import { Observable } from 'rxjs';
import { Injectable } from '@nestjs/common';
import { UserRolesUpdatedEvent } from 'src/gateway/events/user/user-roles-updated.event';
import { map } from 'rxjs/operators';
import { UpdateUserRolesCommand } from 'src/user/command/UpdateUserRoles/update-user-roles.command';

@Injectable()
export class UserSaga {
  @Saga()
  listenReactions = (events$: Observable<any>): Observable<ICommand> => {
    return events$.pipe(
      ofType(UserRolesUpdatedEvent),
      map(t => new UpdateUserRolesCommand(t.id, t.roles)),
    );
  };
}
