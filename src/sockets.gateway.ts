import {
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    WsResponse,
    OnGatewayInit,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Client, Server, Socket } from 'socket.io';

@WebSocketGateway()
export class SocketsGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    handleConnection(client: any, ...args: any[]) {
        console.log('connect :', client.handshake.query.user);
        this.users.set(client.client.id, client.handshake.query.user);
        this.print();
    }
    handleDisconnect(client: Socket) {
        console.log('disconnect');
        this.users.delete(client.client.id);
        this.print();
    }

    print() {
        for (let [k, v] of this.users) {
            console.log(k + '=' + v);
        }
        console.log('total : ' + this.users.size);
    }

    @WebSocketServer()
    server: Server;

    static socketServer: Server;

    private users: Map<string, string> = new Map<string, string>();
    afterInit() {
        SocketsGateway.socketServer = this.server;
    }

    // @SubscribeMessage('connect')
    // onConnect(@MessageBody() data: any): Observable<WsResponse<number>> {
    //     console.log(data);
    // }

    @SubscribeMessage('events')
    findAll(client: Client, data: any): Observable<WsResponse<number>> {
        SocketsGateway.socketServer.sockets.emit('events', 'events');
        return from([1, 2, 5]).pipe(
            map(item => ({ event: 'events', data: item })),
        );
    }

    @SubscribeMessage('identity')
    async identity(client: Client, data: number): Promise<number> {
        return data;
    }

    static notifyAll() {
        this.socketServer.sockets.emit('events', 'events');
    }
}
