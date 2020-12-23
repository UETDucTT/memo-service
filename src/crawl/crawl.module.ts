import { Module } from '@nestjs/common';
import { CrawlerService } from './crawl.service';
@Module({
  exports: [CrawlerService],
  providers: [CrawlerService],
})
export class CrawlerModule {}
