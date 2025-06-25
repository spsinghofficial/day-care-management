import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for frontend communication
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      // Allow localhost:3000 and any subdomain
      if (
        origin === 'http://localhost:3000' ||
        origin.match(/^http:\/\/.*\.localhost:3000$/)
      ) {
        return callback(null, true);
      }
      
      // Reject other origins
      return callback(new Error('Not allowed by CORS'));
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    optionsSuccessStatus: 200, // Some legacy browsers choke on 204
  });

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Set API prefix
  app.setGlobalPrefix('api');

  // Setup Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Daycare Management API')
    .setDescription('Complete API documentation for the Daycare Management System. This multi-tenant SaaS platform manages daycare operations including child enrollment, parent communication, staff management, attendance tracking, billing, and more.')
    .setVersion('1.0')
    .addTag('auth', 'Authentication and user management')
    .addTag('children', 'Child enrollment and management')
    .addTag('parent-relationships', 'Parent-child relationship management')
    .addTag('classrooms', 'Classroom and assignment management')
    .addTag('attendance', 'Attendance tracking')
    .addTag('billing', 'Billing and payment processing')
    .addTag('communications', 'Messages and announcements')
    .addTag('documents', 'Document management')
    .addTag('photos', 'Photo upload and gallery')
    .addTag('staff', 'Staff management and scheduling')
    .addTag('analytics', 'Reports and analytics')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth', // This name here is important for matching up with @ApiBearerAuth() in your controller!
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customSiteTitle: 'Daycare Management API Docs',
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 API Server running on http://localhost:${port}/api`);
  console.log(`📚 API Documentation available at http://localhost:${port}/api/docs`);
}
bootstrap();
