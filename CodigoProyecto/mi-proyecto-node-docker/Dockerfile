FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm install -g wait-port

CMD ["sh", "-c", "wait-port postgres_db:5432 && npm start"]