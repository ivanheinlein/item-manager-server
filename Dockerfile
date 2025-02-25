FROM node:14.15.5-alpine
WORKDIR /item-manager-node
COPY package.json ./
RUN npm install --only=production
COPY . .
EXPOSE 3000
CMD npm run start
