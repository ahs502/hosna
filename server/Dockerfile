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
COPY server/package*.json server/

RUN cd shared && npm ci && \
    cd ../server && npm ci

COPY --chown=nodeuser:nodejs shared shared
COPY --chown=nodeuser:nodejs server server

USER nodeuser

EXPOSE 7002

# HEALTHCHECK --interval=30s --timeout=10s --retries=3 CMD wget --no-verbose --tries=1 --spider http://localhost:7002/health || exit 1

CMD ["node", "server/scripts/wait-for-postgres-then-start.cjs"]

