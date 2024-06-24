FROM oven/bun:slim

COPY package.json ./
COPY bun.lockb ./
COPY src ./src
COPY public ./public

RUN bun install 
CMD [ "bun", "run", "start" ]