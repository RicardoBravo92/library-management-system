FROM node:20-alpine AS builder

WORKDIR /usr/src

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

CMD ["sh", "-c", "npm run db:deploy && npm run dev"]

# para pruebas con seed
#CMD ["sh", "-c", "npm run db:deploySeed && npm run dev"]