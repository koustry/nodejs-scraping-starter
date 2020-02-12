FROM node:latest

WORKDIR /app

ADD .env .
ADD package*.json ./
ADD ./src/ ./src/

RUN npm install

ENTRYPOINT ["npm", "start"]
