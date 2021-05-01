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
  runAgentCommand: async (node, agent, command, callback) => {
    const { data } = await axios.post(`/commands/agent/${node}/${agent}`, { command });
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
    axios.get(`/query/${db}/${collection}`, query)
      .then((res) => {
        callback(res.data);
      })
      .catch((e) => { callback({ error: e.response.status }); });
  },
  querySOHData: (node, request, callback) => {
    axios.post(`/query/soh/${node}`, request)
      .then((res) => {
        callback(res.data);
      })
      .catch((e) => {
        callback({ error: e.response.status, message: e.response.message });
      });
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
  postEvent: async (commandNode, event, callback) => {
    await axios.post(`/events/${commandNode}`, { event });
    callback();
  },
};
