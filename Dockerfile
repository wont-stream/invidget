FROM oven/bun:alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN bun install
COPY . .

EXPOSE 3000

CMD [ "bun", "run" "src/index.js" ]