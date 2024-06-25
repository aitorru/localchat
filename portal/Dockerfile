FROM oven/bun:slim

COPY . .

RUN bun install && bun run build
CMD [ "bun", "run", "start" ]