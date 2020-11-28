import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Client, Server, Socket } from 'socket.io';

@WebSocketGateway()
export class NotificationGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() wss: Server;
  private logger: Logger = new Logger('NotificationGateway');

  afterInit(server: any) {
    this.logger.log('init');
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.warn('connect', client.id);
  }

  handleDisconnect(client: Socket) {
    this.logger.error('disconnect', client.id);
  }

  // @SubscribeMessage('userJoin')
  // connectUser(client: Socket, userId: string) {
  //   console.log(userId);
  //   client.join(userId);
  //   client.emit('userJoin', userId);
  // }

  @SubscribeMessage('ductt')
  connectUser1(data: any) {
    console.log(data);
  }

  sendToUser(userId: string, data: any) {
    this.wss.to(userId).emit('push_noti', data);
  }
}
