# docker build --no-cache --platform=linux/amd64 -t transia/explorer-main -f Dockerfile . --build-arg VUE_APP_WSS_ENDPOINT=ws://localhost:6006 --build-arg PORT=4000
# docker push transia/explorer-main
FROM ubuntu:latest as cloner
WORKDIR /app

RUN apt-get update && \
    apt-get install -y git

RUN git clone https://github.com/Transia-RnD/XRPL-Technical-Explorer.git explorer && cd explorer && git checkout standalone-main

FROM node:16.17.0-alpine AS builder
WORKDIR /app

RUN npm install -g @vue/cli@latest

COPY --from=cloner /app/explorer /app

RUN npm install

ARG VUE_APP_WSS_ENDPOINT
ENV VUE_APP_WSS_ENDPOINT $VUE_APP_WSS_ENDPOINT
RUN npm run build

FROM nginx:alpine as production
WORKDIR /app

COPY --from=builder /app/dist /usr/share/nginx/html
ARG PORT
EXPOSE $PORT

RUN sed -i "s/listen  .*/listen ${PORT};/g" /etc/nginx/conf.d/default.conf

# docker run --name technical-explorer -p 4000:4000 --rm transia/explorer-main
