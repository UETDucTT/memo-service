FROM node:12-alpine as builder

ENV NODE_OPTIONS --max_old_space_size=8192
RUN yarn global add @nestjs/cli
WORKDIR /build
COPY libs ./libs
COPY package.json yarn.lock  ./
COPY patches ./patches
RUN yarn install
COPY . .
RUN yarn build

FROM node:12-alpine

WORKDIR /app
COPY libs ./libs
COPY package.json yarn.lock ./
RUN yarn install --production
COPY --from=builder /build/dist .
ENV NODE_ENV production
EXPOSE 3000
CMD ["main.js"]
