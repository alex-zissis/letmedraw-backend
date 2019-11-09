FROM node:12.12.0-alpine

RUN apk --no-cache add --virtual builds-deps build-base python

RUN mkdir -p /opt/app/letmedraw
WORKDIR /opt/app/letmedraw

COPY package.json .
COPY package-lock.json .
RUN npm i

COPY . .

CMD [ "node", "server.js" ]
EXPOSE 3000