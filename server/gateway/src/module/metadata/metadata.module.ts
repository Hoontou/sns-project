import { Module } from '@nestjs/common';
import { MetadataController } from './metadata.controller';
import { MetadataService } from './metadata.service';
import { ClientsModule } from '@nestjs/microservices';
import { metadataMicroserviceOptions } from 'src/grpc/connection.options';

@Module({
  imports: [ClientsModule.register([metadataMicroserviceOptions])],
  controllers: [MetadataController],
  providers: [MetadataService],
})
export class MetadataModule {}
