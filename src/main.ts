import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, Logger, ValidationPipe } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { setupSwagger } from 'util/swagger';

async function bootstrap() {
  const configService = new ConfigService();
  const port = configService.get<number>('SERVER_PORT') || 8888;

  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      // whitelist: true,
      transform: true,
      exceptionFactory: (errors: ValidationError[] = []) => {
        if (errors.length > 0) {
          const firstError = errors[0];
          const errorFormat = Object.values(
            firstError.constraints ||
              firstError.children[0].constraints ||
              firstError.children[0].children[0].constraints,
          );
          return new BadRequestException(errorFormat[0]);
        }
      },
    }),
  );
  setupSwagger(app);

  app.enableCors();
  await app.startAllMicroservices();
  const server = await app.listen(port, () => {
    Logger.log(`🚀 Server on http://localhost:${port}/graphql`);
  });
}
bootstrap();
