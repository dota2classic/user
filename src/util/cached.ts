import { REDIS_PASSWORD, REDIS_URL } from 'src/config/env';
import { queryCacheFactory } from 'd2c-rcaches';

export const cached = queryCacheFactory({
  url: REDIS_URL(),
  password: REDIS_PASSWORD(),
  ttl: 0,
});
