import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
export const swagger = async (app: INestApplication) => {
  const options = new DocumentBuilder()
    .setTitle('Respiree-API')
    .setDescription('Respiree App Backend APIs')
    .setVersion('1.0')
    .addBearerAuth()
    .addApiKey(
      { type: 'apiKey', name: 'server-auth-key', in: 'header' },
      'server-auth-key',
    )
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api/explorer', app, document);
};
