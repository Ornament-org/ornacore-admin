FROM node:22-alpine AS base

WORKDIR /app

ENV npm_config_update_notifier=false

COPY package*.json ./


FROM base AS development

ENV NODE_ENV=development

RUN npm ci

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev"]


FROM base AS builder

ARG APP_ENV=prod
ARG VITE_API_BASE_URL=https://backend.orna.vedantaa.in
ARG VITE_APP_NAME="OrnaCore Admin Toolbox"
ARG VITE_APP_ENV=production
ARG VITE_ENABLE_DEMO_DATA=false
ARG VITE_STOREFRONT_URL=https://orna.vedantaa.in
ARG VITE_GOOGLE_CLIENT_ID=

ENV VITE_API_BASE_URL=${VITE_API_BASE_URL} \
    VITE_APP_NAME=${VITE_APP_NAME} \
    VITE_APP_ENV=${VITE_APP_ENV} \
    VITE_ENABLE_DEMO_DATA=${VITE_ENABLE_DEMO_DATA} \
    VITE_STOREFRONT_URL=${VITE_STOREFRONT_URL} \
    VITE_GOOGLE_CLIENT_ID=${VITE_GOOGLE_CLIENT_ID}

RUN npm ci --include=dev

COPY . .

RUN if [ -f ".env.${APP_ENV}" ]; then cp ".env.${APP_ENV}" .env.production; fi

ENV NODE_ENV=production

RUN npm run build


FROM nginx:1.27-alpine AS production

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
