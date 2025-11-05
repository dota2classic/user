export interface ExpectedConfig {
  redis: {
    host: string;
    password: string;
  };
  fluentbit: {
    host: string;
    port: number;
    disabled: boolean;
  };
  postgres: {
    host: string;
    port: number;
    username: string;
    password: string;
  };
  rabbitmq: {
    host: string;
    port: number;
    user: string;
    password: string;
  };
  scalet: boolean;
  steamKey: string;
  pushgatewayUrl: string;
}

export default (): ExpectedConfig => {
  return {
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      password: process.env.REDIS_PASSWORD || '',
    },
    fluentbit: {
      host: process.env.FLUENTBIT_HOST || 'localhost',
      port: parseInt(process.env.FLUENTBIT_PORT || '24224'),
      disabled: process.env.FLUENTBIT_DISABLED === 'true',
    },
    postgres: {
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT || '5432'),
      username: process.env.POSTGRES_USERNAME || 'postgres',
      password: process.env.POSTGRES_PASSWORD || '',
    },
    rabbitmq: {
      host: process.env.RABBITMQ_HOST || 'localhost',
      port: parseInt(process.env.RABBITMQ_PORT || '5672'),
      user: process.env.RABBITMQ_USER || 'guest',
      password: process.env.RABBITMQ_PASSWORD || 'guest',
    },
    scalet: process.env.SCALET === 'true',
    steamKey: process.env.STEAM_API_KEY || '',
    pushgatewayUrl: process.env.PUSHGATEWAY_URL || '',
  };
};
