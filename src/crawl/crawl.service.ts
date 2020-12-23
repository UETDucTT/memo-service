import { Injectable } from '@nestjs/common';
import axios from 'axios';
import cheerio from 'cheerio';

const AxiosInstance = axios.create();

@Injectable()
export class CrawlerService {
  public async getPreviewLink(url: string): Promise<any> {
    const data = await AxiosInstance.get(url).then(res => {
      const html = res.data;
      const $ = cheerio.load(html);
      const title = $('[property="og:title"]')
        ?.first()
        ?.attr('content');
      const image = $('[property="og:image"]')
        ?.first()
        ?.attr('content');
      const description = $('[property="og:description"]')
        ?.first()
        ?.attr('content');
      return {
        title,
        image,
        description,
        url: res.config.url,
      };
    });
    return data;
  }
}
