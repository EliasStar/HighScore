FROM node:12.16-buster AS build

COPY ./src/ /HighScore/src
COPY ./package.json /HighScore/
COPY ./tsconfig.json /HighScore/

ENV NODE_ENV=development
WORKDIR /HighScore/

RUN npm install
RUN ./node_modules/.bin/tsc


FROM node:12.16-buster

WORKDIR /HighScore/
ENV NODE_ENV=production KEY_PATH=server.key CERTIFICATE_PATH=server.cert

COPY --from=build /HighScore/build/ ./
COPY --from=build /HighScore/package.json ./

RUN npm install --only=prod

EXPOSE 80 443
VOLUME [ "/HighScore/keys" ]

CMD ["node", "mainServer.js"]