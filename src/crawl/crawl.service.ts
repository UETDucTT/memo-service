import { Injectable } from '@nestjs/common';
import Meta from 'html-metadata-parser';
import get from 'lodash.get';


@Injectable()
export class CrawlerService {
  public async getPreviewLink(url: string): Promise<any> {
    const data = await Meta.parser(url);
    const obj = {
      title: get(data, 'meta.title') || get(data, 'og.title'),
      image: get(data, 'og.image'),
      description: get(data, 'meta.description') || get(data, 'og.description'),
      url: get(data, 'og.url') || url,
    }
    return obj;
  }
}
