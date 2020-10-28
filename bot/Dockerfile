FROM node:14.13.0-alpine3.11

WORKDIR /home/node/app

COPY ./ /home/node/app

RUN npm install
RUN npm install -g nodemon

ENTRYPOINT npm run dev