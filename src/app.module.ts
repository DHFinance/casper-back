import { MailerModule } from '@nestjs-modules/mailer';
// import { HandlebarsAdapter, MailerModule } from "@nest-modules/mailer";
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from 'nestjs-config';
import * as path from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PaymentModule } from './payment/payment.module';
import { PosModule } from './pos/pos.module';
import { StoresModule } from './stores/stores.module';
import { TransactionModule } from './transaction/transaction.module';
import { UserModule } from './user/user.module';

const isProduction = process.env.npm_lifecycle_event === 'start:prod';
const dotEnvPath = isProduction
  ? path.resolve(__dirname, '..', '.env.staging')
  : path.resolve(__dirname, '..', '.env');

@Module({
  imports: [
    ConfigModule.load(
      path.resolve(__dirname, 'config', '**!(*.d).config.{ts,js}'),
      {
        path: dotEnvPath,
      },
    ), //ci
    TypeOrmModule.forRootAsync({
      useFactory: (config: ConfigService) => {
        return {
          ...config.get('database.config'),
          entities: [path.join(__dirname, '**', '*.entity.{ts,js}')],
        };
      },
      inject: [ConfigService],
    }),
    MailerModule.forRoot({
      transport: {
        host: process.env.MAILER_HOST,
        SSL: !!process.env.MAILER_SSL,
        QAuth: !!process.env.MAILER_QAUTH,
        port: process.env.MAILER_PORT,
        auth: {
          user: process.env.MAILER_EMAIL,
          pass: process.env.MAILER_PASSWORD,
        },
      },
      template: {
        dir: __dirname + '/../src/mail-templates',
        adapter: new HandlebarsAdapter(), // or new PugAdapter()
        options: {
          strict: true,
        },
      },
    }),
    UserModule,
    AuthModule,
    PaymentModule,
    TransactionModule,
    StoresModule,
    PosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
