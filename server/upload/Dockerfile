FROM node:alpine

WORKDIR /usr/src/app
COPY *.json ./
RUN npm i 

#COPY ./ ./
COPY ./files ./files
CMD npm run dev
