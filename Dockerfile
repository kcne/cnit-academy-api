FROM node:23-alpine

WORKDIR /usr/src/app

RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    npm ci

COPY . .

RUN npx prisma db push
RUN npx prisma db seed # not needed in prod

EXPOSE 3000

CMD npm run dev
