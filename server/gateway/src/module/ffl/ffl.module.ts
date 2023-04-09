import { Module } from '@nestjs/common';
import { FflController } from './ffl.controller';
import { FflService } from './ffl.service';

@Module({
  controllers: [FflController],
  providers: [FflService],
})
export class FflModule {}
