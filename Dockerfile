FROM node:alpine

WORKDIR /usr/src/app



COPY package.json .

RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

FROM node:alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --only=production
COPY --from=0 /usr/src/app/build ./build

ENV POSTGRES_HOST =hattie.db.elephantsql.com
ENV POSTGRES_PORT = 5432
ENV POSTGRES_USER = govfwqej
ENV POSTGRES_DB = govfwqej
ENV BUCKET_NAME = study-resources-pdf
ENV PROJECT_ID = study-resources-app
EXPOSE 80
CMD npm start