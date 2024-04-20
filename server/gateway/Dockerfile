FROM node:18.14.2-alpine3.16

RUN apk add tzdata

WORKDIR /usr/src/app
COPY *.json ./
RUN npm i 

COPY ./ ./
CMD npm run start:dev
