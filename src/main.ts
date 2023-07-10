import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config'
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
  );
  app.useGlobalPipes(new ValidationPipe())
 
  const config = new DocumentBuilder()
    .addBearerAuth()
    .setTitle("Incode app")
    .setDescription("Simple login app")
    .setVersion("1.0")
    .addTag("API")
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup("api",app,document)

  const configService = app.get(ConfigService)
  const port = configService.get("port")
  await app.listen(port);
}
bootstrap();
