FROM node:14.12-alpine AS build


COPY package.json .

RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

FROM node:alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --only=production
COPY --from=build ./dist ./dist

ENV POSTGRES_HOST =hattie.db.elephantsql.com
ENV POSTGRES_PORT = 5432
ENV POSTGRES_USER = govfwqej
ENV POSTGRES_DB = govfwqej
ENV BUCKET_NAME = study-resources-pdf
ENV PROJECT_ID = study-resources-app
ENTRYPOINT [ "npm" ]
CMD ["run", "start:prod"]