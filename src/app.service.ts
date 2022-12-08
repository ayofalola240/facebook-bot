import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import request from 'request';
@Injectable()
export class AppService {
  private verify_token: string;
  private page_access_token: string;

  constructor(private readonly configService: ConfigService) {
    this.verify_token = this.configService.get<string>('VERIFY_TOKEN');
    this.page_access_token =
      this.configService.get<string>('PAGE_ACCESS_TOKEN');
  }
  getHello(): string {
    return 'Hello World!';
  }
  async postWebHooks(body: any): Promise<any> {
    // Handle the message, depending on its type
    if (body.object === 'page') {
      body.entry.forEach((entry: any) => {
        const webhook_event = entry.messaging[0];

        // Get the sender PSID
        let sender_psid = webhook_event.sender.id;

        // Handle the event based on its type
        if (webhook_event.message) {
          this.handleMessage(sender_psid, webhook_event.message);
        } else if (webhook_event.postback) {
          this.handlePostback(sender_psid, webhook_event.postback);
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
  // Handles messages events
  async handleMessage(sender_psid: any, received_message: any): Promise<any> {
    let response: any;

    // Check if the message contains text
    if (received_message.text) {
      // Create the payload for a basic text message
      response = {
        text: `You sent the message: "${received_message.text}". Now send me an image!`,
      };
    } else if (received_message.attachments) {
      // Gets the URL of the message attachment
      let attachment_url = received_message.attachments[0].payload.url;
      response = {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'generic',
            elements: [
              {
                title: 'Is this the right picture?',
                subtitle: 'Tap a button to answer.',
                image_url: attachment_url,
                buttons: [
                  {
                    type: 'postback',
                    title: 'Yes!',
                    payload: 'yes',
                  },
                  {
                    type: 'postback',
                    title: 'No!',
                    payload: 'no',
                  },
                ],
              },
            ],
          },
        },
      };
    }

    // Sends the response message
    return this.callSendAPI(sender_psid, response);
  }

  // Handles messaging_postbacks events
  async handlePostback(
    sender_psid: any,
    received_postback: any,
  ): Promise<any> {}

  // Sends response messages via the Send API
  async callSendAPI(sender_psid: any, response: any): Promise<any> {
    // Construct the message body
    let request_body = {
      recipient: {
        id: sender_psid,
      },
      message: response,
    };
    // Send the HTTP request to the Messenger Platform
    //   try {
    //     const response = await axios({
    //       method: 'POST',
    //       url: 'https://graph.facebook.com/v2.6/me/messages',
    //       headers: {
    //         authorization: `Bearer ${this.page_access_token}`,
    //       },
    //       data: request_body,
    //     });
    //     return response;
    //   } catch (error) {
    //     console.log(JSON.stringify(error));
    //     throw new BadRequestException();
    //   }

    // Send the HTTP request to the Messenger Platform
    request(
      {
        uri: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: this.page_access_token },
        method: 'POST',
        json: request_body,
      },
      (err, res, body) => {
        if (!err) {
          console.log('message sent!');
        } else {
          console.error('Unable to send message:' + err);
        }
      },
    );
  }
}
