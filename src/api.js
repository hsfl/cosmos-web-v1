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
  findNodeCommands: async (commandNode, callback) => {
    const { data } = await axios.get(`/commands/${commandNode}`);
    callback(data);
  },
  insertNodeCommand: async (req, commandNode, callback) => {
    const { data } = await axios.post(`/commands/${commandNode}`, req);
    callback(data);
  },
  deleteNodeCommand: async (commandName, commandNode, callback) => {
    await axios.delete(`/commands/${commandNode}`, {
      data: {
        event_name: commandName,
      },
    });
    callback();
  },
  getQuery: async (db, collection, query, callback) => {
    const { data } = await axios.get(`/query/${db}/${collection}`, query);
    callback(data);
  },
  getNodes: async (callback) => {
    const { data } = await axios.get('//nodes');
    callback(data);
  },
  getAgents: async (callback) => {
    const { data } = await axios.get('//agents');
    callback(data);
  },
  getNamespaceAll: async (callback) => {
    const { data } = await axios.get('/namespace/all');
    callback(data);
  },
  getNamespacePieces: async (callback) => {
    const { data } = await axios.get('/namespace/pieces');
    callback(data);
  },
};
