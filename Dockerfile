FROM node:24-alpine

WORKDIR /app

COPY server/package*.json ./server/
RUN npm ci --prefix server --omit=dev

COPY . .

WORKDIR /app/server
EXPOSE 8123

CMD ["node", "server.js"]
