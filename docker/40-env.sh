#!/bin/sh
cat > /usr/share/nginx/html/env.js <<JS
window.__ENV__={VUE_APP_WSS_ENDPOINT:"${VUE_APP_WSS_ENDPOINT}",VUE_APP_NETWORK:"${VUE_APP_NETWORK}"};
JS
