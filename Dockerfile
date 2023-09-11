FROM node:18-alpine

WORKDIR /app

COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json

RUN npm ci

COPY . /app

# Dependencies to run an http server and serve the catalog and assets
RUN npm install concurrently

ENTRYPOINT ["./entrypoint.sh"]
