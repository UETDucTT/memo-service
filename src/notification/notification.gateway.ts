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
import { Client, Server, Socket } from 'socket.io';

@WebSocketGateway({ namespace: '/alert' })
export class NotificationGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() wss: Server;

  afterInit(server: any) {
    console.log('sdfsdfdsfdsfsd');
  }

  handleConnection(client: Socket, ...args: any[]) {
    console.log(client.id);
  }

  handleDisconnect(client: Socket) {
    console.log(client.id);
  }

  @SubscribeMessage('userJoin')
  connectUser(client: Socket, userId: string) {
    client.join(userId);
    client.emit('userJoin', userId);
  }

  sendToUser(userId: string, data: any) {
    this.wss.to(userId).emit('push_noti', data);
  }
}
