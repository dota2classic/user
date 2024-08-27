import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';

// @Catch()
// export class SentryExceptionHandler implements ExceptionFilter {
//   constructor(@InjectSentry() private readonly client: SentryService) {}
//   catch(exception: unknown, host: ArgumentsHost) {
//     this.client.instance().captureException(exception);
//   }
// }
