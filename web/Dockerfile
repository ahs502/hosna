FROM node:22-bullseye-slim

RUN apt-get update && \
    apt-get install -y wget && \
    apt-get clean && \
    mkdir -p /monorepo && \
    addgroup --system nodejs && \
    adduser --system --ingroup nodejs nodeuser && \
    chown -R nodeuser:nodejs /monorepo

WORKDIR /monorepo

COPY shared/package*.json shared/
COPY web/package*.json web/

RUN cd shared && npm ci && \
    cd ../web && npm ci

COPY --chown=nodeuser:nodejs shared shared
COPY --chown=nodeuser:nodejs web web

RUN cd web && npm run build:stage

USER nodeuser

EXPOSE 7001

# HEALTHCHECK --interval=30s --timeout=10s --retries=3 CMD wget --no-verbose --tries=1 --spider http://localhost:7001/health || exit 1

CMD ["npm", "--prefix", "web", "start"]
