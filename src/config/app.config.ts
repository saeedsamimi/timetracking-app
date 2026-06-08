import { ConfigType, registerAs } from '@nestjs/config';

const appConfig = registerAs('app', () => ({
  env: process.env.NODE_ENV ?? 'development',
  isProduction: process.env.NODE_ENV === 'production',
  host: process.env.HOST || '0.0.0.0',
  httpPort: parseInt(process.env.HTTP_PORT ?? '3005', 10),
  grpcPort: parseInt(process.env.GRPC_PORT ?? '5005', 10),
}));

export default appConfig;
export type AppConfig = ConfigType<typeof appConfig>;
