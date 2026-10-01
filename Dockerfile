# Static build served by nginx. VUE_APP_WSS_ENDPOINT / VUE_APP_NETWORK / PORT
# are read at container start: docker/40-env.sh writes them to /env.js, and
# nginx's entrypoint substitutes ${PORT} into default.conf.template.
#   docker run --rm -p 4000:4000 -e VUE_APP_WSS_ENDPOINT=wss://xahau-dev.net ghcr.io/tequdev/xrpl-technical-explorer:xahau-devnet
FROM node:16.17.0-alpine AS build
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --ignore-scripts
COPY . .
RUN yarn build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY docker/default.conf.template /etc/nginx/templates/
COPY docker/40-env.sh /docker-entrypoint.d/
RUN chmod +x /docker-entrypoint.d/40-env.sh
ENV PORT=4000 VUE_APP_WSS_ENDPOINT=ws://localhost:6006
EXPOSE 4000
