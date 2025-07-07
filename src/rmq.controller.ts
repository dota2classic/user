import { Controller, Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ConfigService } from '@nestjs/config';
import { UserSubscriptionPaidEvent } from 'src/gateway/events/user/user-subscription-paid.event';
import { AddSubscriptionDaysCommand } from 'src/user/command/AddSubscriptionDaysCommand/add-subscription-days.command';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';

@Controller()
export class RmqController {
  private readonly logger = new Logger(RmqController.name);

  constructor(
    private readonly cbus: CommandBus,
    private readonly config: ConfigService,
  ) {}

  @RabbitSubscribe({
    exchange: 'app.events',
    routingKey: UserSubscriptionPaidEvent.name,
    queue: `user-queue.${UserSubscriptionPaidEvent.name}`,
  })
  async UserSubscriptionPaidEvent(data: UserSubscriptionPaidEvent) {
    await this.cbus.execute(
      new AddSubscriptionDaysCommand(data.steamId, data.days),
    );
  }
}
