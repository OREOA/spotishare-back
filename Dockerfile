FROM node:14 as base

WORKDIR /usr/src/app

EXPOSE 5000

COPY package* ./

RUN npm install

COPY . .