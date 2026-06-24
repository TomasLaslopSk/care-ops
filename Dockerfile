# Single-service image: build the React web, then run care-api which serves both
# the API and the built web from one origin. Deploy this one image to Railway/Render/Fly.

# 1) Build the frontend (care-ops-console)
FROM node:22-slim AS web
WORKDIR /web
COPY care-ops-console/package*.json ./
RUN npm install --legacy-peer-deps
COPY care-ops-console/ ./
RUN npm run build

# 2) Runtime: care-api (tsx) serving the built web
FROM node:22-slim AS run
WORKDIR /app
COPY care-api/package*.json ./
RUN npm install
COPY care-api/ ./
COPY --from=web /web/dist ./public
ENV FRONTEND_DIST=/app/public
ENV DATA_DIR=/data
ENV NODE_ENV=production
# PORT is provided by the host (Railway/Render set it); care-api reads process.env.PORT.
EXPOSE 3001
CMD ["npm", "run", "start"]
