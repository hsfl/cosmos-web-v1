import rest from 'axios';
import { w3cwebsocket as W3CWebSocket } from 'websocket';

export function socket() {
  return new W3CWebSocket(`ws://${process.env.API_IP}:${process.env.WEBSOCKET_PORT}`);
}

export const axios = rest.create({
  baseURL: `http://${process.env.API_IP}:${process.env.REST_PORT}`,
});

// api requests supported
export const COSMOSAPI = {
  runAgentCommand: async (command, callback) => {
    const { data } = await axios.post('/commands/agent', { command });
    callback(data);
  },
  runCommand: async (req, callback) => {
    const { data } = await axios.post('/commands', req);
    callback(data);
  },
  getNodeCommands: async (commandNode, callback) => {
    const { data } = await axios.get(`/commands/${commandNode}`);
    callback(data);
  },
  postNodeCommand: async (req, commandNode, callback) => {
    const { data } = await axios.post(`/commands/${commandNode}`, req);
    callback(data);
  },
};
