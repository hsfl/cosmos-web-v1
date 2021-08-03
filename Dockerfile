FROM node:lts as react

ARG API_IP=localhost

# rely on caching if we don't need to npm install (ie: no change to package.json)
RUN mkdir -p /cosmos-web
WORKDIR /cosmos-web
COPY package.json ./
RUN npm install

COPY . ./
RUN echo "API_IP=$API_IP\n" \
         "WEBSOCKET_PORT=8081\n" \
         "REST_PORT=8082\n" \
         "COSMOS_DIR=/cosmos/\n" \
         "FLIGHT_MODE=false\nbunnies\n" > .env

CMD ["npm", "start"]
