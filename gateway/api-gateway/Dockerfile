FROM node:18-alpine
WORKDIR /app
RUN npm install -g ts-node typescript ts-node-dev
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]