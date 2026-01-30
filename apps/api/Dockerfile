FROM node:20-alpine

WORKDIR /usr/src/app

COPY package.json ./
RUN npm install --production

COPY src ./src
COPY .env.example ./.env

ENV NODE_ENV=production

EXPOSE 8000

CMD ["npm", "start"]
