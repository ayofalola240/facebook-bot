import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class AppService {
  private verify_token: string;
  constructor(private readonly configService: ConfigService) {
    this.verify_token = this.configService.get<string>('VERIFY_TOKEN');
  }
  getHello(): string {
    return 'Hello World!';
  }
  async postWebHooks(body: any): Promise<any> {
    // Handle the message, depending on its type
    if (body.object === 'page') {
      body.entry.forEach((entry: any) => {
        const webhookEvent = entry.messaging[0];
        console.log(webhookEvent);
        // Handle the event based on its type
        if (webhookEvent.message) {
          // handleMessage(webhookEvent);
        } else if (webhookEvent.postback) {
          // handlePostback(webhookEvent);
        }
      });
      return {
        status: 'SUCCESS',
        data: 'EVENT_RECEIVED',
      };
    } else {
      throw new NotFoundException();
    }
  }

  async getWebhook(query: any): Promise<any> {
    let mode = query['hub.mode'];
    let token = query['hub.verify_token'];
    let challenge = query['hub.challenge'];

    // Check if a token and mode is in the query string of the request
    if (mode && token) {
      // Check the mode and token sent is correct
      if (mode === 'subscribe' && token === this.verify_token) {
        // Respond with the challenge token from the request
        console.log('WEBHOOK_VERIFIED');
        return challenge;
      }
    } else {
      throw new NotFoundException();
    }
  }
}
