import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatService } from './chat.service';
import axios from 'axios';

@Injectable()
export class AppService {
  private verify_token: string;
  private page_access_token: string;
  private pageID: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly chatService: ChatService,
  ) {
    this.verify_token = this.configService.get<string>('VERIFY_TOKEN');
    this.page_access_token =
      this.configService.get<string>('PAGE_ACCESS_TOKEN');
    this.pageID = this.configService.get<string>('PAGE_ID');
  }

  async postWebHooks(body: any): Promise<any> {
    // Handle the message, depending on its type
    try {
      if (body.object === 'page') {
        body.entry.forEach((entry: any) => {
          const webhook_event = entry.messaging[0];

          // Get the sender PSID
          const sender_psid = webhook_event.sender.id;

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
    } catch (error) {
      console.log(error);
    }
  }

  async getWebhook(query: any): Promise<any> {
    try {
      const mode = query['hub.mode'];
      const token = query['hub.verify_token'];
      const challenge = query['hub.challenge'];

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
    } catch (error) {
      console.log(error);
    }
  }
  // Handles messages events
  async handleMessage(sender_psid: any, received_message: any): Promise<any> {
    try {
      //check the incoming message is a quick reply?
      if (
        received_message &&
        received_message.quick_reply &&
        received_message.quick_reply.payload
      ) {
        const payload = received_message.quick_reply.payload;
        if (payload === 'CATEGORIES') {
          await this.chatService.sendCategories(sender_psid);
        } else if (payload === 'LOOKUP_ORDER') {
          await this.chatService.sendLookupOrder(sender_psid);
        } else if (payload === 'TALK_AGENT') {
          await this.chatService.requestTalkToAgent(sender_psid);
        }
        return;
      }
      let response: any;

      // Check if the message contains text
      if (received_message.text) {
        // Create the payload for a basic text message
        response = {
          text: `You sent the message: "${received_message.text}". Now send me an image!`,
        };
      } else if (received_message.attachments) {
        // Gets the URL of the message attachment
        const attachment_url = received_message.attachments[0].payload.url;
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
      return this.chatService.sendMessage(sender_psid, response);
    } catch (error) {
      console.error(error);
    }
  }
  async getUserName(sender_psid: any): Promise<string> {
    console.log('Gettings profile with sender: ' + sender_psid);
    try {
      const res: any = await axios.get(
        `https://graph.facebook.com/${sender_psid}?fields=first_name,last_name,profile_pic&access_token=${this.page_access_token}`,
      );
      const { data } = res;
      const userName = `${data.last_name} ${data.first_name}`;
      return userName;
    } catch (error) {
      console.log(`An err occur ${JSON.stringify(error)}`);
    }
  }
  // Handles messaging_postbacks events
  async handlePostback(sender_psid: any, received_postback: any): Promise<any> {
    let response = {};

    // Get the payload for the postback
    const payload = received_postback.payload;

    switch (payload) {
      case 'yes':
        response = { text: 'Thanks!' };
        break;
      case 'no':
        response = { text: 'Oops, try sending another image.' };
        break;
      case 'GET_STARTED':
        await this.chatService.sendWelcomeMessage(sender_psid);
        break;
      default:
        console.log('run default switch case');
    }
  }

  async handleSetupProfile(): Promise<any> {
    try {
      const request_body = {
        get_started: {
          payload: 'GET_STARTED',
        },
        greeting: [
          {
            locale: 'default',
            text: 'Hello!',
          },
          {
            locale: 'en_US',
            text: 'Timeless apparel for the masses.',
          },
        ],
        persistent_menu: [
          {
            locale: 'default',
            composer_input_disabled: false,
            call_to_actions: [
              {
                type: 'postback',
                title: 'Talk to an agent',
                payload: 'TALK_AGENT',
              },
              {
                type: 'postback',
                title: 'Restart this conversation',
                payload: 'RESTART_CONVERSATION',
              },
            ],
          },
        ],
        whitelisted_domains: ['https://facebook-bot.herokuapp.com'],
      };
      const res = await axios({
        method: 'POST',
        url: `https://graph.facebook.com/v2.6/${this.pageID}/messenger_profile`,
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

  async sendTypingOn(sender_psid: any): Promise<any> {
    try {
      const request_body = {
        recipient: {
          id: sender_psid,
        },
        sender_action: 'typing_on',
      };

      const res = await axios({
        method: 'POST',
        url: 'https://graph.facebook.com/v2.6/me/messages',
        headers: {
          authorization: `Bearer ${this.page_access_token}`,
        },
        data: request_body,
      });
    } catch (error) {
      console.log(`An error occur ${JSON.stringify(error)}`);
    }
  }

  async markMessageRead(sender_psid: any): Promise<any> {
    try {
      const request_body = {
        recipient: {
          id: sender_psid,
        },
        sender_action: 'mark_seen',
      };

      const res = await axios({
        method: 'POST',
        url: 'https://graph.facebook.com/v2.6/me/messages',
        headers: {
          authorization: `Bearer ${this.page_access_token}`,
        },
        data: request_body,
      });
    } catch (error) {
      console.log(`An error occur ${JSON.stringify(error)}`);
    }
  }
}
