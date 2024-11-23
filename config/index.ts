import { ConfigModule } from '@nestjs/config';

export type Config = {
  environment: 'dev' | 'production';
  port: number;
  cdekApiUrl: string;
  cdekClientId: string;
  cdekClientSecret: string;
};

export default async function loadConfig(): Promise<Config> {
  await ConfigModule.envVariablesLoaded;

  const environment =
    process.env.NODE_ENV === 'production' ? 'production' : 'dev';

  const config: Config = {
    environment,
    port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
    cdekApiUrl: process.env.CDEK_API_URL!,
    cdekClientId: process.env.CDEK_CLIENT_ID!,
    cdekClientSecret: process.env.CDEK_CLIENT_SECRET!,
  };

  return config;
}
