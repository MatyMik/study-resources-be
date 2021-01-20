FROM node:alpine

COPY package.json .

RUN npm install --legacy-peer-deps

COPY . .
ENV POSTGRES_HOST =hattie.db.elephantsql.com
ENV POSTGRES_PORT = 5432
ENV POSTGRES_USER = govfwqej
ENV POSTGRES_DB = govfwqej
ENV BUCKET_NAME = study-resources-pdf
ENV PROJECT_ID = study-resources-app
ENTRYPOINT [ "npm" ]
CMD [ "start" ]