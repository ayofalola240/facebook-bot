import { Injectable, forwardRef, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppService } from './app.service';
import * as Templetes from './utils/messageTemplete';
import axios from 'axios';
import * as moment from 'moment';

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

      const response2 = {
        text: 'At any time, use the menu below to navigate through the features.',
      };
      const response3 = {
        text: 'What can I do to help you today?',
        quick_replies: [
          {
            content_type: 'text',
            title: 'Products',
            payload: 'PRODUCTS',
          },
        ],
      };
      await this.sendMessage(sender_psid, response1);
      await this.sendMessage(sender_psid, response2);
      await this.sendMessage(sender_psid, response3);
    } catch (error) {
      console.log(`An error occur ${JSON.stringify(error)}`);
    }
  }
  async sendProducts(sender_psid: any): Promise<any> {
    try {
      const response = await Templetes.sendProductsTemplate();
      await this.sendMessage(sender_psid, response);
    } catch (error) {
      console.log(`An error occur ${JSON.stringify(error)}`);
    }
  }

  async sendProduct(sender_psid: any, payload: any): Promise<any> {
    const productID = payload.split('_')[1];
    try {
      const response = await Templetes.sendProductTemplate(productID);
      await this.sendMessage(sender_psid, response);
    } catch (error) {
      console.log(`An error occur ${JSON.stringify(error)}`);
    }
  }
  async sendCart(sender_psid: any, payload: any): Promise<any> {
    const productID = payload.split('_')[1];
    const response = {
      text: 'Product added to cart',
    };
    const body = {
      userId: sender_psid,
      date: moment().format(),
      products: [{ productId: productID, quantity: 1 }],
    };
    try {
      await axios({
        url: 'https://fakestoreapi.com/carts',
        method: 'GET',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept-Encoding': '*',
        },
        data: body,
      });
      await this.sendMessage(sender_psid, response);
    } catch (error) {
      console.log(`An error occur ${JSON.stringify(error)}`);
    }
  }
  async backToProducts(sender_psid: any): Promise<any> {
    await this.sendProducts(sender_psid);
  }
}
