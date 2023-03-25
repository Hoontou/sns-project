FROM node:18.14.2-alpine3.16

WORKDIR /usr/src/app
COPY *.json ./
RUN npm i 

#COPY ./ ./
RUN npm update sns-interfaces
CMD npm run start:dev
