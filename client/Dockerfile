FROM node:18.14.2-alpine3.16

WORKDIR /usr/src/app
COPY package.json ./
RUN npm i 

COPY ./ ./
CMD npm start