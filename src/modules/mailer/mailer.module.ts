import { Module } from '@nestjs/common';
import { MailerResolver } from './resolver';
import { MailerService } from './service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { TransportType } from '@nestjs-modules/mailer/dist/interfaces/mailer-options.interface';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { BullModule } from '@nestjs/bull';
import { MailerModule } from '@nestjs-modules/mailer';
import { MAIL_QUEUE } from 'config';
import { MailProcessor } from './processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([]),

    MailerModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('MAIL_HOST'),
          port: configService.get<string>('MAIL_PORT'),
          secure: true,
          requireTLS: true,
          auth: {
            user: configService.get<string>('MAILDEV_INCOMING_USER'),
            pass: configService.get<string>('MAILDEV_INCOMING_PASS'),
          },
        } as TransportType,

        template: {
          dir: './apps/mailer-service/src/templates',
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),

    BullModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get<string>('REDIS_HOST'),
          port: configService.get<number>('REDIS_PORT'),
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: MAIL_QUEUE,
    }),
  ],
  providers: [MailerResolver, MailerService, MailProcessor],
})
export class MailModule {}
