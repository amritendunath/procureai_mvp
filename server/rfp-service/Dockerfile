FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN apk -U add openssl
RUN npm install

COPY . .

# Generate Prisma Client
RUN npx prisma generate

RUN npm run build

EXPOSE 3002

CMD ["npm", "run", "start"]
