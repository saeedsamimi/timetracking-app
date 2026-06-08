import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import appConfig, { AppConfig } from '../config/app.config';
import databaseConfig, { DatabaseConfig } from '../config/database.config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [databaseConfig.KEY, appConfig.KEY],
      useFactory: (db: DatabaseConfig, app: AppConfig) => ({
        type: 'postgres',
        host: db.host,
        port: db.port,
        username: db.username,
        password: db.password,
        database: db.name,
        autoLoadEntities: true,
        synchronize: !app.isProduction,
      }),
    }),
  ],
})
export class DatabaseModule {}
