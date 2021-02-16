import { Module } from '@nestjs/common';
import { CrawlerModule } from 'src/crawl/crawl.module';
import { PreviewLinkController } from './link-preview.controller';
import { PreviewLinkService } from './link-preview.service';

@Module({
  imports: [CrawlerModule],
  controllers: [PreviewLinkController],
  providers: [PreviewLinkService],
})
export class PreviewLinkModule {}
