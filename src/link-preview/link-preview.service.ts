import { Injectable } from '@nestjs/common';
import { CrawlerService } from 'src/crawl/crawl.service';

@Injectable()
export class PreviewLinkService {
  constructor(private readonly crawlService: CrawlerService) {}

  async getLinkPreview(url: string) {
    return await this.crawlService.getPreviewLink(url);
  }
}
