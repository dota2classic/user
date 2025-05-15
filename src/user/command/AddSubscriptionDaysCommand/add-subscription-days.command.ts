export class AddSubscriptionDaysCommand {
  constructor(
    public readonly steamId: string,
    public readonly days: number
  ) {
  }
}
