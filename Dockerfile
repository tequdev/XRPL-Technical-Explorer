# Runs the vue-cli dev server so VUE_APP_WSS_ENDPOINT / VUE_APP_NETWORK / PORT
# are read at container start, not baked in at build time.
#   docker run --rm -p 4000:4000 -e VUE_APP_WSS_ENDPOINT=wss://xahau-dev.net ghcr.io/tequdev/xrpl-technical-explorer:xahau-devnet
FROM node:16.17.0-alpine
WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --ignore-scripts

COPY . .

ENV HOST=0.0.0.0 PORT=4000 VUE_APP_WSS_ENDPOINT=ws://localhost:6006
USER node
EXPOSE 4000
CMD ["yarn", "serve"]
