import { Injectable, forwardRef, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppService } from './app.service';
import * as Templetes from './utils/messageTemplete';
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
  async sendWelcomeMessage(sender_psid: any): Promise<any> {
    try {
      const username = await this.appService.getUserName(sender_psid);
      //send text message
      const response1 = {
        text: `Hi ${username}! welcome to my clothing shop.`,
      };

      //send an image
      const response2 = {
        attachment: {
          type: 'image',
          payload: {
            url: 'https://bit.ly/imageWelcome',
          },
        },
      };

      const response3 = {
        text: 'At any time, use the menu below to navigate through the features.',
      };
      const response4 = {
        text: 'What can I do to help you today?',
        quick_replies: [
          {
            content_type: 'text',
            title: 'Categories',
            payload: 'CATEGORIES',
          },
          {
            content_type: 'text',
            title: 'Lookup Order',
            payload: 'LOOKUP_ORDER',
          },
          {
            content_type: 'text',
            title: 'Talk to an agent',
            payload: 'TALK_AGENT',
          },
        ],
      };
      await this.sendMessage(sender_psid, response1);
      await this.sendMessage(sender_psid, response2);
      await this.sendMessage(sender_psid, response3);
      await this.sendMessage(sender_psid, response4);
    } catch (error) {
      console.log(`An error occur ${JSON.stringify(error)}`);
    }
  }
  async sendCategories(sender_psid: any): Promise<any> {
    try {
      const response = await Templetes.sendCategoriesTemplate();
      await this.sendMessage(sender_psid, response);
    } catch (error) {
      console.log(`An error occur ${JSON.stringify(error)}`);
    }
  }

  async sendLookupOrder(sender_psid: any): Promise<any> {}
  async requestTalkToAgent(sender_psid: any): Promise<any> {}
}
