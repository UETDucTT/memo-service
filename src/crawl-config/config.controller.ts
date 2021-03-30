import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
  ValidationPipe,
  UsePipes,
  Body,
  Delete,
  UseInterceptors,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthMeta } from 'src/auth/auth.decorator';
import { CrawlConfigService } from './config.service';
import { TransformInterceptor } from './transform.inteceptor';
import {
  CreateConfigDto,
  ParamConfigDto,
  EditConfigDto,
  RunCrawlDto,
  TestCrawlDto,
} from './config.dto';

@Controller('configs')
@ApiTags('Config Action')
@UseInterceptors(new TransformInterceptor())
export class ConfigController {
  constructor(private configService: CrawlConfigService) {}

  @Get(['/get-all'])
  @ApiBearerAuth('Authorization')
  @ApiResponse({
    status: 200,
    description: 'get list config',
  })
  async getAllConfig(@AuthMeta() user): Promise<any> {
    const configs = await this.configService.getAllConfigs();
    return {
      configs,
    };
  }

  @Patch(['/:id'])
  @ApiBearerAuth('Authorization')
  @ApiResponse({
    status: 200,
    description: 'edit config',
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async editConfig(
    @Param() params: ParamConfigDto,
    @AuthMeta() user,
    @Body() editConfigDto: EditConfigDto,
  ): Promise<any> {
    const updatedConfig = await this.configService.update(
      params.id,
      editConfigDto,
    );
    return {
      id: updatedConfig,
    };
  }

  @Delete(['/:id'])
  @ApiBearerAuth('Authorization')
  @ApiResponse({
    status: 200,
    description: 'delete one config',
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async deleteConfig(
    @Param() params: ParamConfigDto,
    @AuthMeta() user,
  ): Promise<any> {
    const deletedConfig = await this.configService.deleteById(params.id);
    return {
      id: deletedConfig,
    };
  }

  @Post([''])
  @ApiResponse({
    status: 200,
    description: 'created config',
  })
  @ApiBearerAuth('Authorization')
  async createConfig(
    @AuthMeta() user,
    @Body() createConfigDto: CreateConfigDto,
  ): Promise<any> {
    const config = await this.configService.create(createConfigDto);
    return {
      id: config.id,
    };
  }

  @Post(['/run-crawl'])
  @ApiResponse({
    status: 200,
    description: 'run crawl',
  })
  @ApiBearerAuth('Authorization')
  async runCrawl(
    @AuthMeta() user,
    @Body() runCrawlDto: RunCrawlDto,
  ): Promise<any> {
    const articles = await this.configService.runCrawl(runCrawlDto);
    return {
      articles,
    };
  }

  @Post(['/test-crawl'])
  @ApiResponse({
    status: 200,
    description: 'run crawl',
  })
  @ApiBearerAuth('Authorization')
  async testCrawl(
    @AuthMeta() user,
    @Body() testCrawlDto: TestCrawlDto,
    @Req() req: any,
  ): Promise<any> {
    const articles = await this.configService.runTestCrawl(req.body.config);
    return {
      articles,
    };
  }
}
