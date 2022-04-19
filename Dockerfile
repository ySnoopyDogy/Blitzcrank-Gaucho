FROM node:16.9.0-alpine

WORKDIR /usr/home/bot

COPY . .

RUN npm install

CMD ["npm", "start"]