import { Injectable, forwardRef, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppService } from './app.service';
import axios from 'axios';

@Injectable()
export class ChatService {
  private page_access_token: string;

  constructor(
    @Inject(forwardRef(() => AppService)) private appService: AppService,
    private readonly configService: ConfigService,
  ) {
    this.page_access_token =
      this.configService.get<string>('PAGE_ACCESS_TOKEN');
  }

  async sendMessage(sender_psid: any, response: any): Promise<any> {
    try {
      this.appService.markMessageRead(sender_psid);
      this.appService.sendTypingOn(sender_psid);
      // Construct the message body
      const request_body = {
        recipient: {
          id: sender_psid,
        },
        message: response,
      };
      // Send the HTTP request to the Messenger Platform
      const res = await axios({
        method: 'POST',
        url: 'https://graph.facebook.com/v2.6/me/messages',
        headers: {
          authorization: `Bearer ${this.page_access_token}`,
        },
        data: request_body,
      });
      return res;
    } catch (error) {
      console.log(`An error occur ${JSON.stringify(error)}`);
    }
  }
}
