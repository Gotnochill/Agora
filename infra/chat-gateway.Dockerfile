FROM node:20-alpine

WORKDIR /app

RUN npm init -y \
    && npm install --omit=dev jose@6.2.8 ws@8.21.0 \
    && npm cache clean --force

COPY infra/chat-gateway.mjs /app/server.mjs

USER node

EXPOSE 8787

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8787/health >/dev/null || exit 1

CMD ["node", "/app/server.mjs"]