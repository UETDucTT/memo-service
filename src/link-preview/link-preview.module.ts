import { Module } from '@nestjs/common';
import { CrawlerModule } from 'src/crawl/crawl.module';
import { PreviewLinkController } from './link-preview.controller';
import { PreviewLinkService } from './link-preview.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Link } from './link-preview.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Link]), CrawlerModule],
  controllers: [PreviewLinkController],
  providers: [PreviewLinkService],
})
export class PreviewLinkModule {}
