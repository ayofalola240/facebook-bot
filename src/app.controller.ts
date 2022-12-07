import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  @Post('/webhook')
  postWebHooks(@Body() body: any): any {
    return this.appService.postWebHooks(body);
  }
  @Get('/webhook')
  getWebhook(@Query() query: any): any {
    return this.appService.getWebhook(query);
  }
}
