import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { useContainer } from 'class-validator';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // Serve static files from uploads directory
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });
  

  // Enable class-validator to use NestJS dependency injection
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  // Enable validation globally
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Enable class-transformer for serialization
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('UNICEF API')
    .setDescription('UNICEF API Documentation')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('auth', 'Authentication endpoints')
    .addTag('admins', 'Admin management endpoints')
    .addTag('modules', 'Module management endpoints')
    .addTag('units', 'Unit management endpoints')
    .addTag('lessons', 'Lesson management endpoints')
    .addTag('xprules', 'XP Rules management endpoints')
    .addTag('badges', 'Badges management endpoints')
    .addTag('audit-logs', 'Audit logs endpoints (superadmin only)')
    .addTag('upload', 'File upload endpoints')
    .addTag('onboarding', 'Onboarding questions endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000,()=>{
    console.log("Swagger is runing at http://localhost:" + process.env.PORT + "/api")
    console.log("Server is runing at http://localhost:" + process.env.PORT)
  });
}
bootstrap();
