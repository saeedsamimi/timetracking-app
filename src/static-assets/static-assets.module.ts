import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import path from 'path';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: path.resolve(__dirname, '..', ' public'),
      serveRoot: '/static',
    }),
  ],
})
export class StaticAssetsModule {}
