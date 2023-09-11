FROM node:18-alpine

WORKDIR /app

COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json
COPY tsconfig.json /app/tsconfig.json
COPY serve.json /app/serve.json

RUN npm ci

COPY . /app

# Dependencies to run an http server and serve the catalog and assets
RUN npm install serve
RUN npm install serve-handler
RUN npm install concurrently

ENTRYPOINT ["./entrypoint.sh"]
