FROM node:16

WORKDIR /home/ts-discord-reminder

COPY . .

RUN npm i -g pnpm
RUN pnpm i

EXPOSE 80
CMD pnpm start