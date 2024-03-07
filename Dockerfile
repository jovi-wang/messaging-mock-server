FROM node:latest

WORKDIR /app

COPY . .

RUN npm install

EXPOSE 3300 3301

CMD ["npm", "run", "dev"]