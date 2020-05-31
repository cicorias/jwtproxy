/* eslint-disable no-console */

// import net, {Socket } from 'net';

import net, { AddressInfo, Server } from 'net';
import events from 'events';

const e = new events.EventEmitter();
let server: Server;
let port: number;

function getOpenPort(): void {
  let sa: AddressInfo | string;

  server = net.createServer();

  server.on('close', () => {
    console.log('closed server');
  });

  server.on('listening', () => {
    //console.log('listening..')
    //sa = server.address() as AddressInfo;
  });

  server.on('error', () => {
    console.error('error during listen')
  });

  server.listen(0, () => {
    sa = server.address() as AddressInfo;
    console.log('open port at')
    sa = server.address() as AddressInfo;
    port = sa.port;
    console.log(port);
    server.close();
    e.emit('found');
    return;
  });

}

//getOpenPort();

export function look():void {
  getOpenPort();
  e.on('found', () => {
    console.log('found a port %s', port);
    return port;
  })
}
