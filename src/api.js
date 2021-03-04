import rest from 'axios';
import { w3cwebsocket as W3CWebSocket } from 'websocket';

export function socket() {
  return new W3CWebSocket(`ws://${process.env.API_IP}:${process.env.WEBSOCKET_PORT}`);
}

export const axios = rest.create({
  baseURL: `http://${process.env.API_IP}:${process.env.REST_PORT}`,
});
