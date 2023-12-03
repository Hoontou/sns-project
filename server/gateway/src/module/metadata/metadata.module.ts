import { Module, forwardRef } from '@nestjs/common';
import { MetadataController } from './metadata.controller';
import { MetadataService } from './metadata.service';
import { ClientsModule } from '@nestjs/microservices';
import { metadataMicroserviceOptions } from 'src/grpc/connection.options';
import { AppModule } from 'src/app.module';

@Module({
  imports: [
    ClientsModule.register([metadataMicroserviceOptions]),
    forwardRef(() => AppModule),
  ],
  controllers: [MetadataController],
  providers: [MetadataService],
  exports: [MetadataService],
})
export class MetadataModule {}
