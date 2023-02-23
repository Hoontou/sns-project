FROM node:18.14.2-alpine3.16

WORKDIR /usr/src/app
COPY *.json ./
RUN npm i 

#COPY ./ ./
COPY ./files ./files
CMD npm run dev
