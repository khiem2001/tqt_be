import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { AuthModule } from 'modules/auth/auth.module';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataloaderModule } from 'modules/dataloader/dataloader.module';
import { DataloaderService } from 'modules/dataloader/dataloader.service';
import { UserModule } from 'modules/user/user.module';
import { MailModule } from 'modules/mailer/mailer.module';
import { MediaModule } from 'modules/media/media.module';
import { ProductModule } from 'modules/product/product.module';
import { SmsModule } from 'modules/sms/sms.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) =>
        ({
          type: 'mongodb',
          url: configService.get('MONGODB_URI'),
          useNewUrlParser: true,
          useUnifiedTopology: true,
          synchronize: true, // Set to false in production
        }) as TypeOrmModuleOptions,
    }),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      imports: [DataloaderModule],
      inject: [DataloaderService],
      driver: ApolloDriver,

      useFactory: (dataloaderService: DataloaderService) => {
        return {
          autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
          sortSchema: true,
          playground: true,
          context: () => ({
            loaders: dataloaderService.createLoaders(),
          }),
        };
      },
    }),
    AuthModule,
    UserModule,
    MailModule,
    MediaModule,
    ProductModule,
    SmsModule,
  ],
})
export class AppModule {}
