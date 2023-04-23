FROM node:18-alpine As development

WORKDIR /usr/app/server

COPY package*.json ./

RUN npm ci

COPY . .

CMD [ "./docker/docker-migrations-entrypoint.sh"]

FROM node:18-alpine As build

WORKDIR /usr/app/server

COPY package*.json ./

COPY --from=development /usr/app/server/node_modules ./node_modules

COPY . .

RUN npm run build

RUN npm ci --only=production && npm cache clean --force

FROM node:18-alpine As production

WORKDIR /usr/app/server

COPY --from=build /usr/app/server/node_modules ./node_modules
COPY --from=build /usr/app/server/dist ./dist


CMD [ "node", "dist/main.js" ]