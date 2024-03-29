import { Module, forwardRef } from '@nestjs/common';
import { MetadataController } from './metadata.controller';
import { MetadataService } from './metadata.service';
import { AppModule } from 'src/app.module';
import { MongooseModule } from '@nestjs/mongoose';
import { MetadataSchema } from './repository/schema/metadata.schema';
import { MetadataCollection } from './repository/metadata.collection';
import { PostModule } from '../post/post.module';
import { FflModule } from '../ffl/ffl.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'metadata', schema: MetadataSchema }]),
    forwardRef(() => AppModule),
    PostModule,
    FflModule,
  ],
  controllers: [MetadataController],
  providers: [MetadataService, MetadataCollection],
  exports: [MetadataService],
})
export class MetadataModule {}
