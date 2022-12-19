import { Body, Controller, Get, Post, Query, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { ChatService } from './chat.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly chatService: ChatService,
  ) {}

  @Get('/')
  getHello(@Res() res: any): any {
    // return res.render('homepage');
    return this.chatService.sendCategories(1111);
  }
  @Post('/webhook')
  postWebHooks(@Body() body: any): any {
    return this.appService.postWebHooks(body);
  }
  @Get('/webhook')
  getWebhook(@Query() query: any): any {
    return this.appService.getWebhook(query);
  }
  @Post('/set-up-profile')
  setUpProfile(@Res() res: any): any {
    this.appService.handleSetupProfile();
    return res.redirect('/');
  }

  @Get('/set-up-profile')
  getProfile(@Res() res: any): any {
    // this.appService.getProfile();
    return res.render('profile');
  }
}
