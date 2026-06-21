FROM node:20-alpine AS builder

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --omit=dev

COPY . .

FROM node:20-alpine

WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/src ./src
COPY --from=builder /usr/src/app/package.json ./

RUN addgroup -g 1001 appgroup && adduser -u 1001 -S appuser -G appgroup
USER appuser

EXPOSE 3005
CMD ["npm", "start"]
