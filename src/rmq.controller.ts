import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { Controller, Logger } from '@nestjs/common';
import { CommandBus, Constructor } from '@nestjs/cqrs';
import { ConfigService } from '@nestjs/config';
import { UserSubscriptionPaidEvent } from 'src/gateway/events/user/user-subscription-paid.event';
import { AddSubscriptionDaysCommand } from 'src/user/command/AddSubscriptionDaysCommand/add-subscription-days.command';

@Controller()
export class RmqController {
  private readonly logger = new Logger(RmqController.name);

  constructor(
    private readonly cbus: CommandBus,
    private readonly config: ConfigService,
  ) {}

  @MessagePattern(UserSubscriptionPaidEvent.name)
  async UserSubscriptionPaidEvent(
    @Payload() data: UserSubscriptionPaidEvent,
    @Ctx() context: RmqContext,
  ) {
    await this.processMessage(
      new AddSubscriptionDaysCommand(data.steamId, data.days),
      context,
    );
  }

  private async construct<T>(
    constructor: Constructor<T>,
    data: any,
  ): Promise<T> {
    const buff = data;
    buff.__proto__ = constructor.prototype;
    return buff;
  }

  private async processMessage<T>(msg: T, context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    return Promise.resolve(msg)
      .then((cmd) => this.cbus.execute(cmd))
      .then(() => channel.ack(originalMsg))
      .catch((e) => {
        this.logger.error(`Error while processing message`, e);
        channel.nack(originalMsg);
      });
  }
}
