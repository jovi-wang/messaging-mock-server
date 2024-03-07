FROM node:alpine

WORKDIR /app

COPY . .

RUN npm install

EXPOSE 3300 3301 8080

CMD ["npm", "run", "start"]
