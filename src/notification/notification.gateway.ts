import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Socket, Server } from 'socket.io';

@WebSocketGateway()
export class NotificationGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('NotificationGateway');

  @SubscribeMessage('msgToServer')
  handleMessage(client: Socket, payload: string): void {
    console.log(client);
    this.server.emit('msgToClient', payload);
  }

  @SubscribeMessage('user-join')
  userJoin(client: Socket, userId: string): void {
    console.log(userId);
    client.join(userId);
  }

  sendToUser(arrayNoti: any[]): void {
    const roomIds = Object.keys(this.server.sockets.adapter.rooms);
    arrayNoti.forEach((el: any) => {
      if (roomIds.includes(el.user.toString())) {
        this.server.to(el.user).emit('push-noti', el);
      }
    });
  }

  afterInit(server: Server) {
    this.logger.log('Init');
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
  }
}
