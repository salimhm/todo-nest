FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma

ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

RUN npx prisma generate

COPY . .

COPY docker/app/entrypoint.sh ./entrypoint.sh
COPY docker/app/wait-for-it.sh ./wait-for-it.sh
RUN chmod +x ./entrypoint.sh ./wait-for-it.sh

RUN npm run build

EXPOSE 3000

CMD ["./entrypoint.sh"]
