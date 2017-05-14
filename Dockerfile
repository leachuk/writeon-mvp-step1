#FROM node:7.7.3
FROM mhart/alpine-node:7.7.3

#Install git for nano-adaptor dependency install. Could change to use a git submodule which might negate this.
RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh

# Provides cached layer for node_modules
ADD package.json /tmp/package.json
#ADD dependencies/nano-adapter/ /tmp/dependencies/nano-adapter
ENV NODE_PATH /app
RUN cd /tmp && npm install --production

RUN mkdir -p /app/server && cp -a /tmp/node_modules /app/
#copy package.json to app so npm run-script can be called
ADD /package.json /app/
ADD /couchdb /app/couchdb

#install pm2 globally
RUN npm install -g pm2

# Define working directory
WORKDIR /app
ADD server /app/server

EXPOSE 9000

ENV NODE_ENV production
CMD ["pm2-docker", "--public", "lira4uhnz1iqo21", "--secret", "2a1aiec0svvgtf0",  "server/app.js", "--web"]
#CMD ["npm", "run", "start-prod"]
#CMD ["npm", "start"]
