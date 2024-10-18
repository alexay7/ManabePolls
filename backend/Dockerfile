# Dockerfile for nestJS backend node 21
FROM node:21-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json yarn.lock ./

RUN yarn install

# Bundle app source
COPY . .

# Build the app
RUN yarn build

# Expose the port the app runs on
EXPOSE 3000

# Serve the app
CMD ["yarn", "start"]